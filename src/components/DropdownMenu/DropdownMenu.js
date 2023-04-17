import { useState } from "react";
import "./DropdownMenu.css";
export default function DropdownMenu(props) {
    const { options, onSelect, listItemClass } = props;
    const [selection, setSelection] = useState(options[0]);

    const selectOnChange = (e) => {
        setSelection(e.target.value);
        onSelect(e.target.value);
    };

    return (
        <div className="dropdown-menu" tabIndex="0">
            <select className="dropdown-menu-list" onChange={selectOnChange}>
                {options.map((option, index) => (
                    <option className={listItemClass}>{option}</option>
                ))}
            </select>
        </div>
    );
}
