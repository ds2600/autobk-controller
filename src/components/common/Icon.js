import react from 'react';
import feather from 'feather-icons';

const Icon = ({ name, ...props }) => {
    const svg = feather.icons[name].toSvg(props);
    return <span dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default Icon;