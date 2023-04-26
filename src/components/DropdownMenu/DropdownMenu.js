import { useState } from "react";
import "./DropdownMenu.css";
export default function DropdownMenu(props) {
    const { options, onSelect, listItemClass, initialSelection } = props;
    const [selection, setSelection] = useState(initialSelection);

    const selectOnChange = (e) => {
        setSelection(e.target.value);
        onSelect(e.target.value);
    };

    return (
        <div className="dropdown-menu" tabIndex="0">
            <select className="dropdown-menu-list" value={selection} onChange={selectOnChange}>
                {options.map((option, index) => {
                    if (option === selection) {
                        return (
                            <option className={listItemClass} selected="selected">
                                {option}
                            </option>
                        );
                    }
                    return <option className={listItemClass}>{option}</option>;
                })}
            </select>
        </div>
    );
}
