import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const useCommonStore = () => {
    const userInfo = useSelector((state: RootState) => state.user.userInfo);
    const menuInfo = useSelector((state: RootState) => state.menu.menuInfo);

    return {
        userInfo,
        menuInfo,
    };
};
