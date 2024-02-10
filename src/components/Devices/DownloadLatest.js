import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
};

const useDownload = () => {
    const downloadFile = async (fileId) => {
      try {
        const response = await axios({
          url: `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/download/${fileId}`,
          method: 'GET',
          responseType: 'blob', // Important
        });
  
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'file';
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
        }
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Error:', error);
        // handle any errors here
      }
    };
  
    return downloadFile;
  };

const DownloadLatest = ({latest})  => {
    const navigate = useNavigate();
    const downloadFile = useDownload();
    const handleClick = (fileId) => {
        navigate(`/download/${fileId}`);
    }
    return (
        <Link className="text-blue-500 hover:text-blue-700" onClick={() => downloadFile(latest.fileId)}>{formatDate(latest.completionTime)}</Link>
    )

}

export default DownloadLatest;