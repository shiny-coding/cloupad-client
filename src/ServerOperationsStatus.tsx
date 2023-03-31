import React, { ReactNode, useRef, useEffect, useState } from 'react';
import './ServerOperationsStatus.scss';
import failIcon from './images/fail.png';
import uptodateIcon from './images/uptodate.png';
import uploadIcon from './images/upload.png';
import downloadIcon from './images/download.png';
import cloudIcon from './images/cloud.png';

type Props = {

};

function useServerOperationsStatus() {

	const [ status, setStatus ] = useState( 'none' );

	useEffect(() => {
		function handleChange( e: any ) {
			setStatus( e.detail.status );
		}
		window.addEventListener( 'serverOperationsStatus', handleChange );
		return () => {
			window.removeEventListener( 'serverOperationsStatus', handleChange );
		};
	}, []);

	return status;
}

export default function ServerOperationsStatus({} : Props) {

	let status = useServerOperationsStatus();

	let icon, tooltip = '';
	switch ( status ) {
		case 'upload': icon = uploadIcon; tooltip = 'Uploading changes to the server'; break;
		case 'download': icon = downloadIcon; tooltip = 'Uploading changes to the server'; break;
		case 'upToDate': icon = uptodateIcon; tooltip = 'Up to date with the server'; break;
		case 'failed': icon = failIcon; tooltip = 'Failed to connect to the server. Retrying in 8sec'; break;
		case 'none': icon = cloudIcon; tooltip = 'Login to sync with the server'; break;
	}

	return <div className="server-operations-status" title={tooltip}><img src={icon} /></div>;
}
