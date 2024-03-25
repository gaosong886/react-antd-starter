import { Button, Layout, Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Layout style={{ height: '100vh' }}>
            <Result
                status='404'
                title='404'
                subTitle={t('hint.404')}
                extra={
                    <Button type='primary' onClick={() => navigate('/')}>
                        {t('function.returnToHome')}
                    </Button>
                }
            />
        </Layout>
    );
};

export default NotFoundPage;
