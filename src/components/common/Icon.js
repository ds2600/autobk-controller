import react from 'react';
import feather from 'feather-icons';

const Icon = ({ name, className, title, ...props }) => {
    const svg = feather.icons[name].toSvg(props);
    return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} title={title}/>;
};

export default Icon;