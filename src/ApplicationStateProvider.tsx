import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { applicationState } from ".";
import ApplicationState, { ApplicationStateContext, ApplicationStateWithSetters } from "./ApplicationState";

type Props = {
	applicationState : ApplicationState;
}

export default function ApplicationStateProvider({ children, applicationState } : PropsWithChildren<Props>) {

	let applicationStateWithSetters: ApplicationStateWithSetters = {} as ApplicationStateWithSetters;

	let applicationStateWithSettersAsAny: any = applicationStateWithSetters;
	for ( let property in applicationState ) {
		let [ propertyValue, propertySetter ] = useState( applicationState[ property as keyof ApplicationState ] ); // eslint-disable-line
		applicationStateWithSettersAsAny[ property ] = propertyValue;
		let setterName = 'set' + property[0].toUpperCase() + property.substr(1);
		applicationStateWithSettersAsAny[ setterName ] = propertySetter;
	}

	return <ApplicationStateContext.Provider value={applicationStateWithSetters}>
				{children}
			</ApplicationStateContext.Provider>;
}