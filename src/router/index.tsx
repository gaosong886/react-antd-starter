import { useRoutes } from 'react-router-dom';
import appRoutes from './config';

const AppRouter: React.FC = () => {
    return <>{useRoutes(appRoutes)}</>;
};

export default AppRouter;
