import { ColumnsType } from 'antd/es/table';
import { Button, Flex, Popconfirm, Spin, Table } from 'antd/lib';
import { useAxios } from '../../../../hooks/axios';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { RoleFormModal } from './components/role-form-modal';
import { useTranslation } from 'react-i18next';
import { API } from '../../../../api/constants';
import { ResCode, Res, SysRole } from '../../../../api/types';

/**
 * 角色管理
 */
const RoleManagementPage: React.FC = () => {
    const { t } = useTranslation();

    // 表格数据请求状态对象
    const tableReqState = useAxios<Res<SysRole[]>>({ url: API.ROLE_LIST, method: 'get', manual: false });

    // '删除' 请求状态对象
    const deleteReqState = useAxios<Res<undefined>>({});

    // Modal 相关状态
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<SysRole>();

    // 点击 '删除'
    const handleDelete = async (id: number) => {
        const res = await deleteReqState.fetchAsync({
            url: `${API.ROLE_DELETE}/${id}`,
            method: 'post',
        });
        if (res?.code === ResCode.SUCCESS) tableReqState.fetch();
    };
    
    // 表格列
    const columns: ColumnsType<SysRole> = [
        {
            title: t("form.common.name"),
            dataIndex: 'name',
            key: 'name',
            width: 220,
        },
        {
            title: t("form.common.description"),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: t("form.common.createAt"),
            dataIndex: 'createAt',
            key: 'createAt',
            width: 220,
        },
        {
            title: t("form.common.updateAt"),
            dataIndex: 'updateAt',
            key: 'updateAt',
            width: 220,
        },
        {
            title: t("form.common.operation"),
            dataIndex: '',
            key: 'x',
            width: 170,
            fixed: 'right',
            render: (_value: unknown, record: SysRole) => {
                return (
                    <Flex gap='small'>
                        <Button
                            onClick={() => {
                                setModalData(record);
                                setModalVisible(true);
                            }}
                        >
                            {t("function.edit")}
                        </Button>
                        {record.id != 1 && (
                            <Popconfirm
                                title={t("hint.deleteWarning")}
                                description={t("hint.deleteWarningDetail")}
                                okText={t("function.confirm")}
                                cancelText={t("function.cancel")}
                                onCancel={(e) => {
                                    e?.stopPropagation();
                                }}
                                onConfirm={(e) => {
                                    e?.stopPropagation();
                                    handleDelete(record.id);
                                }}
                                okButtonProps={{ loading: deleteReqState.loading }}
                            >
                                <Button
                                    onClick={(e) => {
                                        e?.stopPropagation();
                                    }}
                                    danger
                                >
                                    {t("function.delete")}
                                </Button>
                            </Popconfirm>
                        )}
                    </Flex>
                );
            },
        },
    ];

    return (
        <>
            <Flex gap='middle' vertical>
                <Flex gap='small' justify='end'>
                    <Button
                        key='new'
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setModalData(undefined);
                            setModalVisible(true);
                        }}
                        type='primary'
                    >
                        {t("function.new")}
                    </Button>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => {
                            tableReqState.fetch();
                        }}
                    >
                        {t("function.refresh")}
                    </Button>
                </Flex>
                <Spin spinning={tableReqState.loading}>
                    <Table key='table' pagination={false} columns={columns} rowKey='id' dataSource={tableReqState.resp?.data || []} scroll={{ x: 900 }} />
                </Spin>
            </Flex>
            {<RoleFormModal key='modal' record={modalData} visible={modalVisible} onOpenChange={setModalVisible} onFinish={tableReqState.fetch} />}
        </>
    );
};

export default RoleManagementPage;
