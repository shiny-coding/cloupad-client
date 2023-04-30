import { SyntheticEvent, useContext, useEffect, useState } from 'react';
import userIcon from './images/user.png';
import './Account.scss';
import { useAuth0, User } from '@auth0/auth0-react';
import environmentConfig from './EnvironmentConfig';
import { ApplicationStateContext } from './ApplicationState';
import { setNextUid } from './Types';
import { changeServerOperationsStatus, scheduleServerOperation } from './ServerOperations';
import { match } from 'assert';
import { sortFilesAndFolders } from './EditorDocument';
import ServerOperationsStatus from './ServerOperationsStatus';

type Props = {
};

type AuthInfo = {
	user: User|undefined;
	isAuthenticated : boolean;
	token: string|undefined;
}

export var authInfo : AuthInfo = {
	user: undefined,
	isAuthenticated: false,
	token: undefined
};

function Account( {}: Props ) {

	const {
		user,
		isAuthenticated,
		loginWithRedirect,
		loginWithPopup,
		logout,
		getAccessTokenSilently,
		getAccessTokenWithPopup,
	} = useAuth0();

	let {	activeDocument, setActiveDocument,
		exploredDocument, setExploredDocument,
		setDocumentWithNameEditing,
		setDocumentWithTabNameEditing,
		previewDocument, setPreviewDocument,
		openedDocuments, setOpenedDocuments,
		documents, setDocuments,
		draggingObject, setDraggingObject } = useContext( ApplicationStateContext );

	const logoutWithRedirect = () => {
		logout({
			logoutParams: {
				returnTo: window.location.origin,
			}
		});
		authInfo = {
			user: undefined,
			isAuthenticated: false,
			token: undefined
		};
	}

	let [apiResponse, setApiResponse] = useState( '' );

	function onLoginClick() {
		loginWithPopup();
	}

	function initializeApplicationState( responseData: any ) {

		if ( responseData.userCreated ) {
			scheduleServerOperation( { type: 'editMany', documents }, documents );
			return;
		}

		let rawDocuments = responseData.documents;
		let rootDocuments = [];
		let maxUid = 0;
		for ( let document of rawDocuments ) {
			if ( document.isFolder ) document.children = [];
			maxUid = Math.max( maxUid, document.uid );
		}

		for ( let document of rawDocuments ) {
			if ( document.path.includes( '/' ) ) {
				let lastSlashIndex = document.path.lastIndexOf( '/' );
				document.name = document.path.substr( lastSlashIndex + 1 );
			} else {
				document.name = document.path;
			}
		}

		sortFilesAndFolders( rawDocuments );

		for ( let document of rawDocuments ) {
			if ( document.path.includes( '/' ) ) {
				let lastSlashIndex = document.path.lastIndexOf( '/' );
				let folderPath = document.path.substr( 0, lastSlashIndex );
				let folderDocument = rawDocuments.filter( ( d:any ) => d.path == folderPath )[ 0 ];
				folderDocument.children.push( document );
			} else {
				rootDocuments.push( document );
			}
		}

		for ( let document of rawDocuments ) {
			delete document.path;
		}

		function findById( uid:any ) {
			if ( uid == -1 ) return null;
			function match( _uid: any ) {
				let matched = rawDocuments.filter( (d:any) => d.uid == _uid );
				return matched.length > 0 ? matched[ 0 ] : null;
			}
			if ( typeof uid == 'number' ) {
				return match( uid );
			}
			return uid.map( ( _uid: any ) => match( _uid ) ).filter( (d:any) => d != null );
		}

		setNextUid( maxUid + 1 );
		setDocuments( rootDocuments );
		setActiveDocument( findById( responseData.activeDocument ?? -1 ) );
		setOpenedDocuments( findById( responseData.openedDocuments ?? [] ) );
		setExploredDocument( findById( responseData.exploredDocument ?? -1 ) );
		setPreviewDocument( findById( responseData.previewDocument ?? -1 ) );
		setDocumentWithNameEditing( null );
		setDocumentWithTabNameEditing( null );
		setDraggingObject( null );
	}

	useEffect( function() {

		if ( !isAuthenticated ) return;
		const requestApi = async function () {
			const token = await getAccessTokenSilently();

			let getParams = new URLSearchParams( {
				userEmail: user?.email as string
			} );
			const response = await fetch( `${environmentConfig.apiOrigin}/getUserData?` + getParams, {
				headers: { Authorization: `Bearer ${token}` }
			});

			authInfo = { isAuthenticated, user, token };

			const responseData = await response.json();
			if ( response.status == 500 ) {
				console.error( responseData );
				if ( responseData.error ) {
					setApiResponse( responseData.err.code );
				}
				return;
			}
			setApiResponse( '' );
			initializeApplicationState( responseData );
		}
		requestApi();
	}, [ isAuthenticated ] );

	return <div className="account">
			<div className="api-response">{apiResponse}</div>
			<ServerOperationsStatus />
			{isAuthenticated && user && <div className="email">{user.name}</div>}
			{isAuthenticated && <div className="button"
						onClick={() => logoutWithRedirect()}
					>Log out</div>}
			{!isAuthenticated && (
					<div className="button"
						onClick={onLoginClick}
					>Log in</div>
			)}
		</div>;
}

export default Account;
