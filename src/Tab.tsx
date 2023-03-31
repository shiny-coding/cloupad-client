import React, { SyntheticEvent, KeyboardEvent, useRef } from 'react';
import EditableField from './EditableField';
import './Tab.scss';

type Props = {
	title: string
	isActive: boolean;
	isPreview: boolean;
	isNew?: boolean;
	isEditing?: boolean;
	onClick: () => void;
	onClose: (e : SyntheticEvent) => void;
	onChange: (newTitle: string) => void;
	onBlur?: (restoreText: string | null) => void;
};

function Tab( { title, isActive, isPreview, onClick, onClose, onChange, onBlur, isNew, isEditing }: Props ) {

	return (
		<div 	className={'tab' + (isActive? ' active' : '') + (isPreview? ' preview' : '') + (isNew ? ' new-tab' : '')}
				onClick={onClick}	>
			<EditableField	text={title}
							onChange={onChange}
							onBlur={onBlur}
							className="title"
							selected={isActive}
							focused={isEditing ?? false} />
			{!isNew &&
				<div className="close-button" onClick={onClose}>x</div>
			}
			<div className="left-corner"></div>
			<div className="right-corner"></div>
			<div className="bottom-white-line"></div>
		</div>
	);
}

export default Tab;
