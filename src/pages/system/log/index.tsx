import { useCallback, useEffect, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { SyncOutlined } from '@ant-design/icons';
import { useAxios } from '../../../hooks/axios';
import { useTranslation } from 'react-i18next';
import { Pagination, ResCode, Res, SysLog } from '../../../api/types';
import { API } from '../../../api/constants';

const UserManagementPage: React.FC = () => {
    const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });
    const [query, setQuery] = useState('');
    const [inputStatus, setInputStatus] = useState<'' | 'warning' | 'error' | undefined>('');

    const tableState = useAxios<Res<Pagination<SysLog>>>({
        url: API.LOG_PAGE,
        data: { ...pagination, query },
        method: 'post',
        manual: true,
    });

    const { t } = useTranslation();

    const truncateState = useAxios<Res<undefined>>({ url: API.LOG_TRUNCATE, method: 'post', manual: true });

    const columns: ColumnsType<SysLog> = [
        {
            title: t('form.user.userId'),
            dataIndex: 'userId',
            key: 'userId',
            width: 80,
        },
        {
            title: t('form.user.nickname'),
            width: 120,
            dataIndex: 'user',
            key: 'user',
            render: (value: any) => {
                return <>{value?.nickname}</>;
            },
        },
        {
            title: t('form.log.url'),
            dataIndex: 'url',
            width: 240,
            key: 'url',
            render: (value: any) => {
                return <a onClick={() => setQuery(value)}>{value}</a>;
            },
        },
        {
            title: t('form.log.params'),
            dataIndex: 'params',
            key: 'params',
            width: 360,
            ellipsis: true,
        },
        {
            title: t('form.log.ip'),
            dataIndex: 'ip',
            key: 'ip',
            width: 120,
        },
        {
            title: t('form.log.requestAt'),
            dataIndex: 'requestAt',
            key: 'requestAt',
            width: 220,
        },
    ];

    const onPaginationChange = useCallback((page: number, pageSize: number) => {
        setPagination({ page, pageSize });
    }, []);

    const onSearch = useCallback(() => {
        if (!query) {
            setInputStatus('error');
            return;
        }
        tableState.fetch({ data: { ...pagination, query } });
    }, [pagination, query, tableState]);

    const onDelete = useCallback(async () => {
        const res = await truncateState.fetchAsync();
        if (res?.code === ResCode.SUCCESS) tableState.fetch();
    }, [tableState, truncateState]);

    useEffect(() => {
        tableState.fetch({ data: { ...pagination, query } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination]);

    return (
        <>
            <Flex gap='middle' vertical>
                <Flex gap='small' justify='space-between'>
                    <Flex gap='small' justify='start'>
                        <Input
                            onChange={(e) => {
                                setInputStatus('');
                                setQuery(e.target.value.trim());
                            }}
                            placeholder={t('form.log.url')}
                            size='middle'
                            value={query}
                            status={inputStatus}
                        />
                        <Button
                            onClick={() => {
                                if (query) {
                                    setQuery('');
                                    tableState.fetch({ data: pagination });
                                }
                            }}
                        >
                            {t('function.reset')}
                        </Button>
                        <Button onClick={onSearch} type='primary'>
                            {t('function.search')}
                        </Button>
                    </Flex>
                    <Flex gap='small' justify='end'>
                        <Popconfirm
                            title={t("hint.clearAllWarning")}
                            description={t("hint.clearAllWarningDetail")}
                            okText={t('function.confirm')}
                            cancelText={t('function.cancel')}
                            onCancel={(e) => {
                                e?.stopPropagation();
                            }}
                            onConfirm={(e) => {
                                e?.stopPropagation();
                                onDelete();
                            }}
                            okButtonProps={{ loading: truncateState.loading }}
                        >
                            <Button
                                onClick={(e) => {
                                    e?.stopPropagation();
                                }}
                                type='primary'
                                danger
                            >
                                {t('function.clearAll')}
                            </Button>
                        </Popconfirm>
                        <Button
                            icon={<SyncOutlined />}
                            onClick={() => {
                                tableState.fetch();
                            }}
                        >
                            {t('function.refresh')}
                        </Button>
                    </Flex>
                </Flex>
                <Spin spinning={tableState.loading}>
                    <Table
                        rowKey='id'
                        columns={columns}
                        pagination={{
                            current: pagination.page,
                            pageSize: pagination.pageSize,
                            defaultCurrent: 1,
                            defaultPageSize: 50,
                            total: tableState.resp?.data?.totalItems,
                            onChange: onPaginationChange,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            pageSizeOptions: [20, 50, 100],
                        }}
                        dataSource={tableState.resp?.data?.data || []}
                        scroll={{ x: 900 }}
                    />
                </Spin>
            </Flex>
        </>
    );
};
export default UserManagementPage;
