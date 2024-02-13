import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import Loading from './common/Loading';
import { toast } from 'react-toastify';

function ReportPage() {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [markdown, setMarkdown] = useState('');
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('jwt');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/reports`, config)
        .then(response => {
          setFiles(response.data)
          setTimeout(() => {
              setLoading(false);
          }, 1000);
        })
        .catch(error => {
          toast.error("Failed to load reports: " + error);
          setTimeout(() => {
              setLoading(false);
          }, 1000);
        });
    }, []);

    useEffect(() => {
        if (selectedFile) {
            setLoading(true);
            if (selectedFile === 'none') {
                setMarkdown('');
                setLoading(false);
                return;
            }
            setMarkdown('Loading...');
            axios.get(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/reports/${selectedFile}`, config)
            .then(response => {
              setMarkdown(response.data)
              setTimeout(() => {
                  setLoading(false);
              }, 1000);
            })
            .catch(error => {
              toast.error("Failed to load report: " + error);
              setTimeout(() => {
                  setLoading(false);
              }, 1000);
            });
        }
    }, [selectedFile]);
    
    return (
        <>
        <div className="container w-full mx-auto mt-6 mb-6 text-slate-800">
            <div className="flex flex-col items-start">
                <select className="mb-4 w-auto" value={selectedFile || ''} onChange={e => setSelectedFile(e.target.value)}>
                    <option value="none">Select a report</option>
                    {files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
                </select>
            </div>
        </div>
        <div className="container w-full mx-auto mt-6 mb-6 text-slate-800">
            <div className="flex flex-col">
                {loading ? (
                    <div className="flex justify-center items-center w-full">
                        <Loading />
                    </div>
                ) : (
                    <ReactMarkdown className="w-full prose-none prose-sm leading-normal">{markdown}</ReactMarkdown>
                )}
            </div>
        </div>
        </>
    );
}

export default ReportPage;