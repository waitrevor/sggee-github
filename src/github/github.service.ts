import { Injectable } from '@nestjs/common';

import * as beautify from 'simply-beautiful';

@Injectable()
export class GithubService {
  readonly owner: string = process.env.GITHUB_OWNER;
  readonly repo: string = process.env.GITHUB_REPO;
  readonly token: string = process.env.GITHUB_API_KEY;
  readonly baseBranch: string = 'main';
  newBranchName: string = 'new-branch';
  readonly commitMessage: string = 'updated main.html';
  filePath: string;
  editorData: string;

  getContent() {
    return this.editorData;
  }

  async getFile() {
    const url: string = `https://api.github.com/repos/${this.owner}/${
      this.repo
    }/contents/${this.filePath}?ref=${
      this.newBranchName
    }&timestamp=${new Date().getTime()}`;

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

      const data = await response.json();

      this.editorData = window.atob(data.content);
    } catch (err) {
      console.log(err);
    }
  }

  async getBranches() {
    console.log(this.owner, this.repo, this.token);
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/branches`;
    try {
      let branches: any = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `token ${this.token}`, // Include the token for private repos
          Accept: 'application/vnd.github.v3+json', // GitHub API version
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

  async getLatestCommitSha(): Promise<string> {
    const url: string = `https://api.github.com/repos/${this.owner}/${
      this.repo
    }/commits/${this.newBranchName}?timestamp=${new Date().getTime()}`;

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

    const data = await response.json();
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
        encoding: 'utf-8',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create blob: ${response.status}`);
    }

    const data: { sha: string } = await response.json();
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

    const data: { sha: string } = await response.json();
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

    const data: { sha: string } = await response.json();
    return data.sha; // Return the SHA of the new commit
  }

  async updateBranchRef(newCommitSha: string): Promise<string> {
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${this.newBranchName}`;

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

    // console.log('Branch updated successfully');
    return 'Branch Updated Successfully';
  }

  async updateFileInrepo(data: string, path: string) {
    try {
      // Step 1: Get the SHA of the latest commit of the branch
      const prevCommitSha = await this.getLatestCommitSha();
      // console.log("Latest Commit Sha", prevCommitSha)

      const file = beautify.html(data);

      // Step 2: Create the new blob with updated content
      // const blobSha = await this.createBlob(file);

      const blobSha = await this.createBlob(file);

      // console.log("Blob Sha", blobSha)

      // Step 3: Create a new tree object that references the new blob
      // const newTreeSha = await this.createTree(
      //   prevCommitSha,
      //   blobSha,
      //   this.filePath,
      // );
      const newTreeSha = await this.createTree(prevCommitSha, blobSha, path);
      // console.log("Tree Sha", newTreeSha)

      // Step 4: Create a new commit with the updated tree
      const newCommitSha = await this.createCommit(
        prevCommitSha,
        newTreeSha,
        this.commitMessage,
      );
      // console.log("New Commit Sha", newCommitSha)

      // Step 5: Update the branch to point to the new commit
      await this.updateBranchRef(newCommitSha);

      // console.log('File updated successfully');
      return 'File updated Successfully';
    } catch (error) {
      console.error('Error updating file:', error);
    }
  }

  async createPullRequest() {
    const url: string = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls`;

    console.log(this.newBranchName);
    try {
      const response: Response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Amazing new feature',
          head: this.newBranchName,
          base: this.baseBranch,
          body: 'Please pull these awesome changes in!',
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to create PR: ${response.status}`);
      }

      const data = await response.json();
      // console.log('Pull Request Created:', data);
      return 'Pull Request Created';
    } catch (err) {
      console.error('Error creating PR:', err);
    }
  }
}
