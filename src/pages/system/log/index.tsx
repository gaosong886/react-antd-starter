import { useCallback, useEffect, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { SyncOutlined } from '@ant-design/icons';
import { useAxios } from '~/hooks/useAxios';
import { useTranslation } from 'react-i18next';
import { Pager, ResCode, Res, SysLog } from '~/api/types';
import { API } from '~/api/constants';

/**
 * 系统日志
 */
const UserManagementPage: React.FC = () => {
    const { t } = useTranslation();

    // 分页状态对象
    const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });

    // 搜索关键词对象
    const [query, setQuery] = useState('');

    // 搜索输入框状态
    const [inputStatus, setInputStatus] = useState<'' | 'warning' | 'error' | undefined>('');

    // 表格数据请求状态对象
    const tableReqState = useAxios<Res<Pager<SysLog>>>({
        url: API.LOG_PAGE,
        data: { ...pagination, query },
        method: 'post',
        manual: true,
    });

    // '清空' 请求状态对象
    const truncateState = useAxios<Res<undefined>>({ url: API.LOG_TRUNCATE, method: 'post', manual: true });

    // 分页变化事件
    const onPaginationChange = useCallback((page: number, pageSize: number) => {
        setPagination({ page, pageSize });
    }, []);

    // 点击 '搜索'
    const onSearch = useCallback(() => {
        if (!query) {
            // 输入为空的时候把输入框状态设为 error
            setInputStatus('error');
            return;
        }
        tableReqState.fetch({ data: { ...pagination, query } });
    }, [pagination, query, tableReqState]);

    // 点击 '清空'
    const onTruncate = useCallback(async () => {
        const res = await truncateState.fetch();
        if (res?.code === ResCode.SUCCESS) tableReqState.fetch();
    }, [tableReqState, truncateState]);

    // 分页变化时，重新获取表格数据
    useEffect(() => {
        tableReqState.fetch({ data: { ...pagination, query } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination]);

    // 表格列
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

    return (
        <>
            <Flex gap='middle' vertical>
                <Flex gap='small' justify='space-between'>
                    <Flex gap='small' justify='start'>
                        <Input
                            name='query'
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
                                    tableReqState.fetch({ data: pagination });
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
                            title={t('hint.clearAllWarning')}
                            description={t('hint.clearAllWarningDetail')}
                            okText={t('function.confirm')}
                            cancelText={t('function.cancel')}
                            onCancel={(e) => {
                                e?.stopPropagation();
                            }}
                            onConfirm={(e) => {
                                e?.stopPropagation();
                                onTruncate();
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
                                tableReqState.fetch();
                            }}
                        >
                            {t('function.refresh')}
                        </Button>
                    </Flex>
                </Flex>
                <Spin spinning={tableReqState.loading}>
                    <Table
                        rowKey='id'
                        columns={columns}
                        pagination={{
                            current: pagination.page,
                            pageSize: pagination.pageSize,
                            defaultCurrent: 1,
                            defaultPageSize: 50,
                            total: tableReqState.resp?.data?.totalItems,
                            onChange: onPaginationChange,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            pageSizeOptions: [20, 50, 100],
                        }}
                        dataSource={tableReqState.resp?.data?.data || []}
                        scroll={{ x: 900 }}
                    />
                </Spin>
            </Flex>
        </>
    );
};
export default UserManagementPage;
