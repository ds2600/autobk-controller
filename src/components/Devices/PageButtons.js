import React from 'react';

function PageButtons({handlePageChange, currentPage, devicesLength, rowsPerPage}) {
    return (
            <div className="flex">
            <button 
                className={`focus:outline-none flex items-center mr-4 ${currentPage === 1 ? 'text-slate-400' : 'text-slate-800 hover:text-slate-500'}`}
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
            >
                &lt; Previous
            </button>
            <button 
                className={`focus:outline-none flex items-center mr-4 ${currentPage === Math.ceil(devicesLength / rowsPerPage) ? 'text-slate-400' : 'text-slate-800 hover:text-slate-500'}`}
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === Math.ceil(devicesLength / rowsPerPage)}
            >
                Next &gt;
            </button>
        </div>
    );
}

export default PageButtons;