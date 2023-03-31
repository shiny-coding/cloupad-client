
let environmentConfig : any = {};
for ( let key in process.env ) {
	if ( key.startsWith( "REACT_APP_" ) ) {
		environmentConfig[ key.substr( "REACT_APP_".length ) ] = process.env[ key ];
	}
}

export default environmentConfig;