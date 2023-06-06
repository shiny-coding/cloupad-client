import { time } from 'console';
import { authInfo } from './Account';
import { EditorDocument, updateDocumentPath } from './EditorDocument';
import environmentConfig from './EnvironmentConfig';

let serverOperationsQueue : any[] = [];
let pendingOperation : any = null;
let currentStatus = 'none';

var timer: any = null;
const debounceTime = 2000;
const retryTime = 8000;

export function changeServerOperationsStatus( newStatus: string ) {
	if ( newStatus != currentStatus ) {
		const event = new CustomEvent( "serverOperationsStatus", { detail: { status: newStatus } } as any );
		window.dispatchEvent( event );
	}
	currentStatus = newStatus;
}

export function scheduleServerOperation( operation: any, rootDocuments: EditorDocument[] ) {

	if ( !authInfo.isAuthenticated ) return;

	if ( operation.type == 'editFile' ) {
		if ( operation.document.name.trim() == '' ) {
			return;
		}
	}
	if ( operation.document ) {
		updateDocumentPath( operation.document, rootDocuments );
	} else if ( operation.documents ) {
		for ( let document of operation.documents ) {
			updateDocumentPath( document, rootDocuments );
		}
	}
	if ( operation.activeDocument ) {
		operation.activeDocument = operation.activeDocument.uid;
	}
	if ( operation.exploredDocument ) {
		operation.exploredDocument = operation.exploredDocument.uid;
	}
	if ( operation.previewDocument ) {
		operation.previewDocument = operation.previewDocument.uid;
	}
	if ( operation.openedDocuments ) {
		operation.openedDocuments = operation.openedDocuments.map( (d:any) => d.uid );
	}

	if ( operation.type == 'editFile' || operation.type == 'deleteFile' ) {
		serverOperationsQueue = serverOperationsQueue.filter(
			o => o.pending || o.type != 'editFile' || o.document.uid != operation.document.uid
		);
	} else if ( operation.type == 'updateUser' ) {
		serverOperationsQueue = serverOperationsQueue.filter( o => o.type != 'updateUser' || o.pending );
	}
	operation.time = new Date().getTime();
	serverOperationsQueue.push( operation );

	changeServerOperationsStatus( 'upload' );
	scheduleProcessServerOperation( debounceTime );
}

function startNextOperation( operation: any ) {

	pendingOperation = operation;
	pendingOperation.pending = true;

	let getParams = new URLSearchParams( {
		userEmail: authInfo.user?.email as string,
		uid: pendingOperation?.document?.uid
	} );

	let method = 'GET';
	if ( operation.type == 'editMany' || operation.type == 'editFile' || operation.type == 'updateUser' ) {
		method = 'POST';
	}
	let body: any = undefined;
	if ( method == 'POST' ) {
		if ( operation.type == 'editMany' || operation.type == 'updateUser' ) {
			body = JSON.stringify( operation );
		} else {
			body = JSON.stringify( operation.document );
		}
	}

	fetch( `${environmentConfig.apiOrigin}/${operation.type}?` + getParams, {

		headers: {
			Authorization: `Bearer ${authInfo.token}`,
			'Content-Type': 'application/json'
		},
		method,
		body

	}).then( function( response ) {

		pendingOperation = null;
		serverOperationsQueue.splice( 0, 1 );
		if ( serverOperationsQueue.length == 0 ) {
			changeServerOperationsStatus( 'upToDate' );
		}

		scheduleProcessServerOperation( debounceTime );

	}).catch( function( error ) {

		pendingOperation.pending = false;
		pendingOperation = null;
		changeServerOperationsStatus( 'failed' );
		scheduleProcessServerOperation( retryTime );
	});
}

function processServerOperations() {

	if ( !serverOperationsQueue.length ) return;
	if ( !authInfo.token ) return;
	if ( pendingOperation ) return;

	let nextOperation = serverOperationsQueue[ 0 ];
	startNextOperation( nextOperation );
}

function scheduleProcessServerOperation( timeout: number ) {
	if ( timeout && timer ) return;
	clearTimeout( timer );
	timer = setTimeout( function() {

		processServerOperations();
		timer = null;

	}, timeout );
}
