
let environmentConfig : any = {};
for ( let key in process.env ) {
	if ( key.startsWith( "REACT_APP_" ) ) {
		environmentConfig[ key.substr( "REACT_APP_".length ) ] = process.env[ key ];
	}
}

if ( environmentConfig.apiOrigin && !environmentConfig.apiOrigin.startsWith( 'http' ) ) {
	environmentConfig.apiOrigin = window.location.origin + environmentConfig.apiOrigin;
}

export default environmentConfig;