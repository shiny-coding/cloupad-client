import { Auth0Provider } from '@auth0/auth0-react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ApplicationState from './ApplicationState';
import ApplicationStateProvider from './ApplicationStateProvider';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { nextUid } from './Types';
import environmentConfig from "./EnvironmentConfig";

import introductionString from './files/introduction';
import bunny from './files/bunny';
import hint from './files/hint';


const reactRoot = ReactDOM.createRoot(
	document.getElementById( 'app' ) as HTMLElement
);

export var applicationState : ApplicationState;
let documents = [ {
	name: 'sample folder',
	isFolder: true,
	expanded: true,
	uid: nextUid(),
	children: [
		{
			name: 'bunny',
			content: bunny,
			uid: nextUid()
		}, {
			name: 'some other note',
			content: hint,
			uid: nextUid()
		}
	]
}, {
	name: 'introduction',
	content: introductionString,
	uid: nextUid()
} ];

applicationState = {
	documents,
	openedDocuments: [ documents[ 1 ] as any, (documents[ 0 ] as any).children[ 1 ] as any ],
	activeDocument: documents[ 1 ] as any,
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