import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubService {
  readonly owner: string = process.env.GITHUB_OWNER!;
  readonly repo: string = process.env.GITHUB_REPO!;
  readonly token: string = process.env.GITHUB_API_KEY!;
  readonly baseBranch: string = 'main';
  editorData: string;

  async getFile(branch: string, path: string) {
    const url: string = `https://api.github.com/repos/${this.owner}/${
      this.repo
    }/contents/${path}?ref=${branch}&timestamp=${new Date().getTime()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const data: any = await response.json();
      this.editorData = atob(data.content);
      return this.editorData;
    } catch (err) {
      console.log(err);
    }
  }

  async getBranches() {
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/branches`;
    try {
      let branches: any = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (!branches.ok) {
        throw new Error(`Failed to fetch branches: ${branches.status}`);
      }
      return branches.json();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async createBranch(data: { baseBranch: string; newBranch: string }): Promise<string> {
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs`;
    const latestSha = await this.getLatestCommitSha(data.baseBranch)
    const response: Response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        ref: `refs/heads/${data.newBranch}`,
        sha: latestSha,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create branch: ${response.status}`);
    }
    return `Successfully created ${data.newBranch}` // Return the commit SHA
  }

  async getLatestCommitSha(branch: string): Promise<string> {
    const url: string = `https://api.github.com/repos/${this.owner}/${
      this.repo
    }/commits/${branch}?timestamp=${new Date().getTime()}`;

    const response: Response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get latest commit SHA: ${response.status}`);
    }

    const data: any = await response.json()
    return data.sha; // Return the commit SHA
  }

  async createBlob(content: string): Promise<string> {
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/git/blobs`;

    const response: Response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        encoding: 'base64',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create blob: ${response.status}`);
    }

    const data: any = await response.json();
    return data.sha; // Return the SHA of the new blob
  }

  async createTree(
    baseTreeSha: string,
    blobSha: string,
    path: string,
  ): Promise<string> {
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees`;

    const response: Response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: [
          {
            path: path,
            mode: '100644',
            type: 'blob',
            sha: blobSha,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create tree: ${response.status}`);
    }

    const data: any = await response.json();
    return data.sha; // Return the SHA of the new tree
  }

  async createCommit(
    parentSha: string,
    treeSha: string,
    message: string,
  ): Promise<string> {
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits`;

    const response: Response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        parents: [parentSha],
        tree: treeSha,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create commit: ${response.status}`);
    }

    const data: any = await response.json();
    return data.sha; // Return the SHA of the new commit
  }

  async updateBranchRef(newCommitSha: string, branch: string): Promise<string> {
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${branch}`;

    const response: Response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sha: newCommitSha,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update branch ref: ${response.status}`);
    }

    return 'Branch Updated Successfully';
  }

  async updateFileInrepo(data: {
    branch: string;
    path: string;
    editorData: string;
  }) {
    try {
      // Step 1: Get the SHA of the latest commit of the branch
      const prevCommitSha = await this.getLatestCommitSha(data.branch);

      // Step 2: Create the new blob with updated content
      const blobSha = await this.createBlob(data.editorData);

      // Step 3: Create a new tree object that references the new blob
      const newTreeSha = await this.createTree(
        prevCommitSha,
        blobSha,
        data.path,
      );

      // Step 4: Create a new commit with the updated tree
      let message = `Updating ${data.path}`;
      const newCommitSha = await this.createCommit(
        prevCommitSha,
        newTreeSha,
        message,
      );

      // Step 5: Update the branch to point to the new commit
      await this.updateBranchRef(newCommitSha, data.branch);

      return 'File updated Successfully';
    } catch (error) {
      console.error('Error updating file:', error);
    }
  }

  async createPullRequest(data: { branch: string; message: string }) {
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls`;

    try {
      const response: Response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${data.branch} pull request`,
          head: data.branch,
          base: this.baseBranch,
          body: data.message,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to create PR: ${response.status}`);
      }

      return 'Pull Request Created';
    } catch (err) {
      console.error('Error creating PR:', err);
    }
  }
}
