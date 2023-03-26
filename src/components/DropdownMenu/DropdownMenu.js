import { useState } from "react";
import "./DropdownMenu.css";
export default function DropdownMenu(props) {
    const { options, onSelect, listItemClass } = props;
    const [selection, setSelection] = useState(options[0]);
    const [isOpen, setIsOpen] = useState(false);

    const selectionOnClick = () => {
        setIsOpen(!isOpen);
    };

    const optionOnClick = (index) => {
        return () => {
            setSelection(options[index]);
            onSelect(options[index]);
            setIsOpen(false);
        };
    };

    return (
        <div className="dropdown-menu">
            <ul className="dropdown-menu-list">
                <li className={listItemClass} onClick={selectionOnClick}>
                    {selection}
                </li>
                {isOpen
                    ? options.map((option, index) =>
                          option === selection ? null : (
                              <li className={listItemClass} onClick={optionOnClick(index)}>
                                  {option}
                              </li>
                          )
                      )
                    : null}
            </ul>
        </div>
    );
}
