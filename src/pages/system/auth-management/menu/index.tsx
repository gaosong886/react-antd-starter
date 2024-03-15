import { ColumnsType } from 'antd/es/table';
import { Button, Flex, Popconfirm, Spin, Switch, Table, Tag } from 'antd/lib';
import { useAxios } from '../../../../hooks/axios';
import Icon, { NodeExpandOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MenuFormModal } from './components/menu-form-modal';
import { useTranslation } from 'react-i18next';
import { buildMenuTree } from '../../../../utils/menu-tree';
import { API } from '../../../../api/constants';
import { ResCode, Res, SysMenuType, SysMenu } from '../../../../api/types';
import * as icons from '@ant-design/icons';

interface ExpandedRows {
    keys: number[];
}

const MenuManagementPage: React.FC = () => {
    const { t } = useTranslation();

    const tableState = useAxios<Res<SysMenu[]>>({ url: API.MENU_LIST, method: 'get' });
    const updateState = useAxios<Res<undefined>>({});

    const [modalData, setModalData] = useState<SysMenu>();
    const [modalVisible, setModalVisible] = useState(false);

    const [parentId, setParentId] = useState(0);
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>();

    const menuTree = useMemo(() => {
        if (tableState.resp?.data) return buildMenuTree(tableState.resp?.data);
    }, [tableState.resp?.data]);

    const columns: ColumnsType<SysMenu> = [
        {
            title: t('form.common.name'),
            dataIndex: 'name',
            key: 'name',
            width: 180,
        },
        {
            title: t('form.common.type'),
            dataIndex: 'type',
            key: 'type',
            width: 90,
            render: (value: unknown) => {
                if (value === SysMenuType.DIRECTORY)
                    return (
                        <Tag bordered={true} color='processing'>
                            {t('form.menu.type.directory')}
                        </Tag>
                    );
                else if (value === SysMenuType.PAGE)
                    return (
                        <Tag bordered={true} color='success'>
                            {t('form.menu.type.page')}
                        </Tag>
                    );
                else
                    return (
                        <Tag bordered={true} color='error'>
                            {t('form.menu.type.operation')}
                        </Tag>
                    );
            },
        },
        {
            title: t('form.menu.hidden'),
            dataIndex: 'hidden',
            key: 'hidden',
            width: 100,
            render: (value: unknown, record: SysMenu) => {
                if (record.type === SysMenuType.OPERATION) return;
                return (
                    <Switch
                        defaultChecked={value === 1}
                        onChange={(_checked, event) => {
                            event.stopPropagation();
                            updateState.fetch({
                                url: `${API.MENU_HIDE}/${record.id}`,
                                method: 'post',
                            });
                        }}
                    />
                );
            },
        },
        {
            title: t('form.menu.icon'),
            dataIndex: 'icon',
            key: 'icon',
            width: 80,
            render: (value: string) => {
                return <Icon key={value} component={(icons as any)[value]} style={{ marginRight: '8px' }} />;
            },
        },
        {
            title: t('form.menu.path'),
            dataIndex: 'path',
            key: 'path',
            width: 300,
        },
        {
            title: t('form.menu.permissions'),
            dataIndex: 'permissions',
            key: 'permissions',
            render: (_value: unknown, record: SysMenu) => {
                return record.permissions?.map((item) => (
                    <Tag bordered={true} color='error' key={item.name}>
                        {item.name}
                    </Tag>
                ));
            },
        },
        {
            title: t('form.menu.order'),
            dataIndex: 'sortWeight',
            key: 'sortWeight',
            width: 80,
        },
        {
            title: t('form.common.operation'),
            dataIndex: '',
            key: 'x',
            width: 240,
            fixed: 'right',
            render: (_value: unknown, record: SysMenu) => {
                return (
                    <Flex gap='small' justify='end'>
                        {record.type != SysMenuType.OPERATION && (
                            <Button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setParentId(record.id);
                                    setModalData(undefined);
                                    setModalVisible(true);
                                }}
                            >
                                {t('function.add')}
                            </Button>
                        )}
                        <Button
                            onClick={(event) => {
                                event.stopPropagation();
                                setParentId(0);
                                setModalData(record);
                                setModalVisible(true);
                            }}
                        >
                            {t('function.edit')}
                        </Button>
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
                            okButtonProps={{ loading: updateState.loading }}
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
                    </Flex>
                );
            },
        },
    ];

    const allRowKeys = useMemo(() => {
        if (!tableState.resp?.data) return [];
        return tableState.resp.data.map((item) => item.id);
    }, [tableState.resp?.data]);

    const expandAll = useCallback(() => {
        setExpandedRows({ keys: allRowKeys });
    }, [allRowKeys]);

    const handleDelete = async (id: number) => {
        const res = await updateState.fetchAsync({
            url: `${API.MENU_DELETE}/${id}`,
            method: 'post',
        });
        if (res?.code === ResCode.SUCCESS) tableState.fetch();
    };

    useEffect(() => {
        tableState.fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Flex gap='middle' vertical>
                <Flex gap='small' justify='space-between'>
                    <Flex gap='small'>
                        <Button
                            icon={<NodeExpandOutlined />}
                            key='expand'
                            onClick={() => {
                                expandAll();
                            }}
                        >
                            {t('function.expand')}
                        </Button>
                    </Flex>
                    <Flex gap='small' justify='end'>
                        <Button
                            key='new'
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setParentId(0);
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
                        key='table'
                        columns={columns}
                        rowKey='id'
                        pagination={false}
                        expandable={{
                            indentSize: 20,
                            expandRowByClick: true,
                            expandedRowKeys: expandedRows?.keys,
                            onExpandedRowsChange: (expandedRows) => {
                                setExpandedRows({ keys: Array.from(expandedRows) as number[] });
                            },
                        }}
                        scroll={{ x: 1500 }}
                        dataSource={menuTree?.tree}
                    />
                </Spin>
            </Flex>
            {
                <MenuFormModal
                    key='modal'
                    parentId={parentId}
                    record={modalData}
                    menuTree={menuTree?.tree || []}
                    visible={modalVisible}
                    onOpenChange={setModalVisible}
                    onFinish={tableState.fetch}
                />
            }
        </>
    );
};

export default MenuManagementPage;
