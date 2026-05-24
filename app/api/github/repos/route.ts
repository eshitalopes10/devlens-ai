import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const octokit = new Octokit({ auth: (session as any)?.accessToken });

  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 20,
  });

  return NextResponse.json(
    data.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      language: r.language,
      stargazers_count: r.stargazers_count,
      open_issues_count: r.open_issues_count,
    }))
  );
}