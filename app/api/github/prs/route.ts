import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

interface PullRequest {
  number: number;
  title: string;
  body: string | null;
  user: { login: string } | null;
  created_at: string;
  head: { sha: string };
  base: { sha: string };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner")!;
  const repo = searchParams.get("repo")!;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const octokit = new Octokit({ auth: (session as any)?.accessToken });

  const { data: prs } = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 10,
  });

  const prsWithDiff = await Promise.all(
    prs.map(async (pr: PullRequest) => {
      let diff = "";
      try {
        const response = await octokit.request(
          "GET /repos/{owner}/{repo}/pulls/{pull_number}",
          {
            owner,
            repo,
            pull_number: pr.number,
            headers: { accept: "application/vnd.github.diff" },
          }
        );
        diff = (response.data as unknown as string).slice(0, 8000);
      } catch {
        diff = "Could not fetch diff.";
      }

      const { data: prDetail } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pr.number,
      });

      return {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        user: pr.user?.login,
        created_at: pr.created_at,
        changed_files: prDetail.changed_files,
        additions: prDetail.additions,
        deletions: prDetail.deletions,
        diff,
      };
    })
  );

  return NextResponse.json(prsWithDiff);
}