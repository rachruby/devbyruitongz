# Dev By Ruitong Z Portfolio Website

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
The site is a macOS-style desktop on the purple sticker wallpaper. The dock sits along the bottom. Drag an app off the dock to leave it on the desktop, drag it back, or drop it on a folder. New Folder adds a folder, and Delete Folder removes the selected one. Projects still opens in Finder. Notes saves what a visitor writes on the site, so the notes are still there the next time Notes is opened.

The notes API is `node server/index.js` (port 4742). The dev server proxies `/api` to it. With `DATABASE_URL` set, notes go to Postgres. Without it, they are stored in `data/visitor-notes.json`. 

Built using React.

In the /personal-portfolio, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
