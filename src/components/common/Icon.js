import react from 'react';
import feather from 'feather-icons';

const Icon = ({ name, className, ...props }) => {
    const svg = feather.icons[name].toSvg(props);
    return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default Icon;