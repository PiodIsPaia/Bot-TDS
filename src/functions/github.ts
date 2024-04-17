import fetch from "node-fetch";

async function checkGithubUserExists(username: string) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        return response.ok;
    } catch (error) {
        console.error("Erro ao verificar a existência do usuário:", error);
        return false;
    }
}

export { checkGithubUserExists };