import React from 'react';
import PageButtons from './PageButtons';


function DevicesFooter({ handleRowsPerPageChange, handlePageChange, currentPage, rowsPerPage, devicesLength }) {

    return (
        <>
        <div className="pt-4 flex justify-between">
            <div className="flex">
                <label>
                    <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                        {[10, 20, 30, 50].map(value => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                        <option value={devicesLength}>All</option>
                    </select>
                </label>
            </div>
            <PageButtons handlePageChange={handlePageChange} currentPage={currentPage} devicesLength={devicesLength} rowsPerPage={rowsPerPage}/>
        </div>
        </>
    );
}

export default DevicesFooter;