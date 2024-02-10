import { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Loading from './common/Loading';
import { saveAs } from 'file-saver';

const DownloadRoute = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const downloadFile = async () => {
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
            if (fileNameMatch.length === 2)
              fileName = fileNameMatch[1];
          }
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();

          if(location.state?.from) {
            navigate(location.state.from);
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Error:', error);
          // handle any errors here
        }
      };
  
      downloadFile();
  }, [fileId]);

  return (
    <Loading />
  );
};

export default DownloadRoute;