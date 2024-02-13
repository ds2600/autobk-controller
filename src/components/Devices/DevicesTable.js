// src/components/Devices/DevicesTable.js

import DataTable from "react-data-table-component";
import DataTableExtensions from "react-data-table-component-extensions";
import 'react-data-table-component-extensions/dist/index.css';
import Loading from "../common/Loading";
import DownloadLatest from "./DownloadLatest";
import ActionsCell from "./ActionsCell";
import { Link } from "react-router-dom";
import Time from "../common/Time";

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
};


function EmptyTable() {
    return (
        <div className="flex items-center justify-center h-32">
            <p className="text-xl text-gray-500">No devices found</p>
        </div>
    );

}

const DevicesTable = ({ refresh, loading, devices, ...props }) => {
    const columns = [
        {
            name: "Name",
            selector: row => <Link className="text-blue-500 hover:text-blue-700" to={`/devices/${row.deviceId}`}>{row.name}</Link>,
            sortable: true
        },
        {
            name: "Management IP",
            selector: row => row.ip,
            sortable: true
        },
        {
            name: "Type",
            selector: row => row.type,
            sortable: true
        },
        {
            name: "Latest Backup",
            // selector: row => row.latestBackup ? formatDate(row.latestBackup.completionTime) : "None",
            sortable: true,
            cell: row => row.latestBackup ? <DownloadLatest latest={row.latestBackup}/> : "None"
        },
        {
            name: "Next Backup",
            selector: row => row.nextSchedule ? <Time time={row.nextSchedule.scheduledTime} /> : row.autoDay === 0 ? 'Not scheduled' : 'Will be scheduled',
            sortable: true
        },
        {
            selector: row => row.type !== "OneNetLog" ? <ActionsCell refresh={refresh} deviceId={row.deviceId} /> : null,
            sortable: false
        }
    ];

    const tableData = {
        columns,
        data: devices,
        export: false,
        print: false
    }

    
    
    return (
        <DataTableExtensions
            {...tableData}
        >
            <DataTable
                progressPending={loading}
                progressComponent={<Loading />}
                noDataComponent={<EmptyTable />}
                columns={columns}
                data={devices}
                {...props}
            />
        </DataTableExtensions>
    );
}

export default DevicesTable;
