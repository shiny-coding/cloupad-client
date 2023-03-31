import { Auth0Provider } from '@auth0/auth0-react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ApplicationState, { ApplicationStateContext } from './ApplicationState';
import ApplicationStateProvider from './ApplicationStateProvider';
import { FileDocument } from './EditorDocument';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { nextUid } from './Types';
import environmentConfig from "./EnvironmentConfig";

const reactRoot = ReactDOM.createRoot(
	document.getElementById( 'app' ) as HTMLElement
);

export var applicationState : ApplicationState;
// let documents = [ {
// 	name: 'folder',
// 	isFolder: true,
// 	expanded: true,
// 	uid: nextUid(),
// 	children: [
// 		{
// 			name: 'filenameB.txt',
// 			content: 'BBBB',
// 			uid: nextUid()
// 		}, {
// 			name: 'filenameC.txt',
// 			content: 'CCCC',
// 			uid: nextUid()
// 		}, {
// 			name: 'filenameD.txt',
// 			content: 'DDDD',
// 			uid: nextUid()
// 		}
// 	]
// }, {
// 	name: 'filenameA.txt',
// 	content: 'AAAA',
// 	uid: nextUid()
// }, {
// 	name: 'filenameE.txt',
// 	content: 'EEEE',
// 	uid: nextUid()
// } ];

// applicationState = {
// 	documents, //:[ documents[ 1 ]],
// 	openedDocuments: [ documents[ 1 ], documents[ 0 ].children?.[ 0 ], documents[ 2 ] ] as FileDocument[],
// 	//openedDocuments: [ documents[ 1 ] ] as FileDocument[],
// 	activeDocument: documents[ 1 ] as FileDocument,
// 	previewDocument: null,
// 	exploredDocument: documents[ 1 ],
// 	draggingObject: null,
// 	documentWithNameEditing: null,
// 	documentWithTabNameEditing: null
// };

// applicationState = {
// 	documents: [ documents[ 1 ] ],
// 	openedDocuments: [],
// 	activeDocument: null,
// 	previewDocument: null,
// 	exploredDocument: null,
// 	draggingObject: null
// };


applicationState = {
	documents : [],
	openedDocuments: [],
	activeDocument: null,
	previewDocument: null,
	exploredDocument: null,
	draggingObject: null,
	documentWithNameEditing: null,
	documentWithTabNameEditing: null
};

function getConfig() {
	// Configure the audience here. By default, it will take whatever is in the config
	// (specified by the `audience` key) unless it's the default value of "YOUR_API_IDENTIFIER" (which
	// is what you get sometimes by using the Auth0 sample download tool from the quickstart page, if you
	// don't have an API).
	// If this resolves to `null`, the API page changes to show some helpful info about what to do
	// with the audience.
	const audience =
		environmentConfig.audience && environmentConfig.audience !== "YOUR_API_IDENTIFIER"
			? environmentConfig.audience
			: null;

	return {
		domain: environmentConfig.domain,
		clientId: environmentConfig.clientId,
		...(audience ? { audience } : null),
	};
}

const config = getConfig();

const onRedirectCallback = () => {
	// history.push(
	// 	appState && appState.returnTo ? appState.returnTo : window.location.pathname
	// );
};

const authConfig = {
	domain: config.domain,
	clientId: config.clientId,
	onRedirectCallback,
	authorizationParams: {
	redirect_uri: window.location.origin,
		...(config.audience ? { audience: config.audience } : null),
	},
};

reactRoot.render(
	// <React.StrictMode>
	<Auth0Provider {...authConfig}>
		<ApplicationStateProvider applicationState={applicationState}>
			<App />
		</ApplicationStateProvider>
	</Auth0Provider>
	// </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

document.addEventListener('keydown',  function(e) {

	if (e.ctrlKey && e.keyCode == 123) debugger;
});