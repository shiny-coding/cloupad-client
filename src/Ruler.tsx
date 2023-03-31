import React, { ReactNode, useRef, useState } from 'react';
import './Ruler.scss';

type Props = {
	initialLinesCount: number;
	setSetLinesCount: ( setLinesCount : ( linesCount : number ) => void ) => void;
};

export default function Ruler({ initialLinesCount, setSetLinesCount } : Props) {

	const ruler = useRef<HTMLDivElement>( null );
	let [ linesCount, setLinesCount ] = useState( initialLinesCount );
	setSetLinesCount( ( linesCount : number ) => setLinesCount( linesCount ) );

	const lines : ReactNode[] = [];
	for ( let i = 0; i < linesCount; ++i ) {
		lines.push( i + 1 );
		lines.push( <br key={i} /> );
	}

	return <div ref={ruler} className="ruler">{lines}</div>;
}
