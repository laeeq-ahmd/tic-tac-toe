# How to Host on Render

I have already configured your project code for deployment. Here is how to push it to Render.

## 1. Push Code to GitHub
Make sure all your latest changes (including the new `render.yaml` and server updates) are committed and pushed to your GitHub repository.

```bash
git add .
git commit -m "Prepare for Render deployment"
git push
```

## 2. Create a Web Service on Render
1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub account if you haven't already.
4.  Find your repository (`tic-tac-toe-plus` or similar) and click **Connect**.
5.  On the creation page:
    *   **Name**: Give it a name like `tic-tac-toe-plus`.
    *   **Runtime**: Select **Node**.
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm run server` (Render might auto-detect these from `render.yaml` if you choose "Deploy from render.yaml" or it might just use the settings)
    *   **Plan**: Select **Free**.
6.  Click **Create Web Service**.

## 3. Alternative: Deploy with Blueprint (Uses `render.yaml`)
1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **New +** and select **Blueprint**.
3.  Connect your repository.
4.  Render will read the `render.yaml` file I created and automatically configure the service.
5.  Click **Apply**.

## 4. Verify
Once deployed, Render will give you a URL (e.g., `https://tic-tac-toe-plus.onrender.com`).
*   Open the URL.
*   Try creating a Multiplayer room.
*   Share the code with a friend (or open in Incognito) to play!

## Technical Changes Made
*   **`server/index.js`**: Updated to serve the built frontend files (`dist` folder) and handle specific environment ports.
*   **`src/lib/socket.ts`**: Updated to automatically connect to the correct server URL in production.
*   **`render.yaml`**: Created a configuration file to tell Render how to build and start your app.
