import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import axios from "axios";
import { toast } from "react-toastify";

const ActionsCell = ({ refresh, deviceId }) => {

    const token = localStorage.getItem('jwt');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const handleBackupNowClick = () => {
        const time = new Date();
    
        axios.post(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/schedules/${deviceId}`, { scheduledTime: time }, config)
        .then((response) => {
            refresh();
            toast.success('Backup scheduled');
        })
        .catch((error) => {
            toast.error('An error occurred while scheduling the backup: ' + error);          
        });
        
    }

    return (
        <div className="flex items-center space-x-2">
            <Link to={`/devices/${deviceId}/edit`} className="inline-block text-blue-500 hover:text-blue-700">
                <Icon name="edit" className="h-4 w-4" title="Edit"/>
            </Link>
            <Link onClick={() => handleBackupNowClick()} className="inline-block text-blue-500 hover:text-blue-700">
                <Icon name="hard-drive" className="h-4 w-4" title="Backup Now"/>
            </Link>
        </div>
    );
}

export default ActionsCell;