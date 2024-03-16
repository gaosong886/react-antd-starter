import { ColumnsType } from 'antd/es/table';
import { Button, Flex, Popconfirm, Spin, Switch, Table, Tag } from 'antd/lib';
import { useAxios } from '../../../../hooks/axios';
import Icon, { NodeExpandOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import { MenuFormModal } from './components/menu-form-modal';
import { useTranslation } from 'react-i18next';
import { buildMenuTree } from '../../../../utils/menu-tree';
import { API } from '../../../../api/constants';
import { ResCode, Res, SysMenuType, SysMenu } from '../../../../api/types';
import * as icons from '@ant-design/icons';

// 展开的 key 列表
interface ExpandedRows {
    keys: number[];
}

/**
 * 菜单管理
 */
const MenuManagementPage: React.FC = () => {
    const { t } = useTranslation();

    // 表格数据请求状态对象
    const tableReqState = useAxios<Res<SysMenu[]>>({ url: API.MENU_LIST, method: 'get', manual: false });

    // '隐藏'、'删除' 请求状态对象
    const updateReqState = useAxios<Res<undefined>>({});

    // Modal 相关状态
    const [modalData, setModalData] = useState<SysMenu>();
    const [modalVisible, setModalVisible] = useState(false);

    // 用来传给 Modal 的父节点 id
    const [parentId, setParentId] = useState(0);

    // 当前被展开的数据行
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>();

    // 把从服务器得到的菜单列表转化成树
    const menuTree = useMemo(() => {
        if (tableReqState.resp?.data) return buildMenuTree(tableReqState.resp?.data);
    }, [tableReqState.resp?.data]);

    // 表格中所有的 key
    const allRowKeys = useMemo(() => {
        if (!tableReqState.resp?.data) return [];
        return tableReqState.resp.data.map((item) => item.id);
    }, [tableReqState.resp?.data]);

    // '展开' 事件
    const expandAll = useCallback(() => {
        setExpandedRows({ keys: allRowKeys });
    }, [allRowKeys]);

    // 点击 '删除'
    const handleDelete = async (id: number) => {
        const res = await updateReqState.fetchAsync({
            url: `${API.MENU_DELETE}/${id}`,
            method: 'post',
        });
        if (res?.code === ResCode.SUCCESS) tableReqState.fetch();
    };

    // 表格列
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
                // 如果节点类型是 '操作'，不需要隐藏
                if (record.type === SysMenuType.OPERATION) return;
                return (
                    <Switch
                        defaultChecked={value === 1}
                        onChange={(_checked, event) => {
                            event.stopPropagation();
                            updateReqState.fetch({
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
                if (value) return <Icon key={value} component={(icons as any)[value]} style={{ marginRight: '8px' }} />;
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
                            okButtonProps={{ loading: updateReqState.loading }}
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
                                tableReqState.fetch();
                            }}
                        >
                            {t('function.refresh')}
                        </Button>
                    </Flex>
                </Flex>
                <Spin spinning={tableReqState.loading}>
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
                    onFinish={tableReqState.fetch}
                />
            }
        </>
    );
};

export default MenuManagementPage;
