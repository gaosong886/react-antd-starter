import { useCallback, useEffect, useState } from 'react';
import { useAxios } from '../../../../hooks/axios';
import { Button, Flex, Popconfirm, Tag, Image, Spin, Input } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { UserFormModal } from './components/user-form-modal';
import { useTranslation } from 'react-i18next';
import { AccountStatus, Pager, ResCode, Res, SysUser } from '../../../../api/types';
import { API } from '../../../../api/constants';

const UserManagementPage: React.FC = () => {
    const { t } = useTranslation();

    const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });
    const [query, setQuery] = useState('');
    const [inputStatus, setInputStatus] = useState<'' | 'warning' | 'error' | undefined>('');
    const tableState = useAxios<Res<Pager<SysUser>>>({
        url: API.USER_PAGE,
        data: { ...pagination, query },
        method: 'post',
        manual: true,
    });
    const deleteState = useAxios<Res<undefined>>({});

    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<SysUser>();

    const columns: ColumnsType<SysUser> = [
        {
            title: t('form.user.photo'),
            dataIndex: 'photo',
            key: 'photo',
            width: 80,
            render: (value: string) => {
                return <Image width={30} src={value}></Image>;
            },
        },
        {
            title: t('form.user.nickname'),
            width: 160,
            dataIndex: 'nickname',
            key: 'nickname',
        },
        {
            title: t('form.user.username'),
            dataIndex: 'username',
            key: 'username',
            width: 200,
        },
        {
            title: t('form.user.roles'),
            dataIndex: 'roles',
            key: 'roles',
            width: 200,
            render: (_value: unknown, record: SysUser) => {
                return (
                    <>
                        {record.roles?.map((item) => (
                            <Tag key={item.id} bordered={true} color='blue'>
                                {item.name}
                            </Tag>
                        ))}
                    </>
                );
            },
        },
        {
            title: t('form.common.status'),
            dataIndex: 'accountStatus',
            key: 'accountStatus',
            width: 80,
            render: (value: unknown) => {
                if (value == AccountStatus.ACTIVE)
                    return (
                        <Tag bordered={true} color='success'>
                            {t('status.normal')}
                        </Tag>
                    );
                else
                    return (
                        <Tag bordered={true} color='error'>
                            {t('status.banned')}
                        </Tag>
                    );
            },
        },
        {
            title: t('form.common.remark'),
            dataIndex: 'remark',
            key: 'remark',
            ellipsis: true,
        },
        {
            title: t('form.common.createAt'),
            dataIndex: 'createAt',
            key: 'createAt',
            width: 220,
        },
        {
            title: t('form.common.updateAt'),
            dataIndex: 'updateAt',
            key: 'updateAt',
            width: 220,
        },
        {
            title: t('form.common.operation'),
            dataIndex: '',
            key: 'x',
            width: 170,
            fixed: 'right',
            render: (_value: unknown, record: SysUser) => {
                return (
                    <Flex gap='small'>
                        <Button
                            onClick={() => {
                                setModalData(record);
                                setModalVisible(true);
                            }}
                        >
                            {t('function.edit')}
                        </Button>
                        {record.id != 1 && (
                            <Popconfirm
                                title={t('hint.deleteWarning')}
                                description={t('hint.deleteWarningDetail')}
                                okText={t('function.confirm')}
                                cancelText={t('function.cancel')}
                                onCancel={(e) => {
                                    e?.stopPropagation();
                                }}
                                onConfirm={(e) => {
                                    e?.stopPropagation();
                                    handleDelete(record.id);
                                }}
                                okButtonProps={{ loading: deleteState.loading }}
                            >
                                <Button
                                    onClick={(e) => {
                                        e?.stopPropagation();
                                    }}
                                    danger
                                >
                                    {t('function.delete')}
                                </Button>
                            </Popconfirm>
                        )}
                    </Flex>
                );
            },
        },
    ];

    const handleDelete = async (id: number) => {
        const res = await deleteState.fetchAsync({
            url: `${API.USER_DELETE}/${id}`,
            method: 'post',
        });
        if (res?.code === ResCode.SUCCESS) tableState.fetch();
    };

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
                            name='query'
                            onChange={(e) => {
                                setInputStatus('');
                                setQuery(e.target.value);
                            }}
                            placeholder={t('form.user.nickname') + ' / ' + t('form.user.username')}
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
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setModalData(undefined);
                                setModalVisible(true);
                            }}
                            type='primary'
                        >
                            {t('function.new')}
                        </Button>
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
            {<UserFormModal record={modalData} visible={modalVisible} onOpenChange={setModalVisible} onFinish={tableState.fetch} />}
        </>
    );
};
export default UserManagementPage;
