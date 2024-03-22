import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAxios } from '../../../../../hooks/axios';
import { Alert, Card, Spin, Tree, TreeProps } from 'antd';
import { DataNode } from 'antd/es/tree';
import { useTranslation } from 'react-i18next';
import { buildMenuTree } from '../../../../../utils/menu-tree';
import { ResCode, Res, SysMenu, SysRole, ValidError } from '../../../../../api/types';
import { API } from '../../../../../api/constants';

export interface RoleFormModalProps {
    visible: boolean;
    record?: SysRole;
    onOpenChange: (visible: boolean) => void;
    onFinish: () => void;
}

/**
 * 角色管理弹窗
 */
export const RoleFormModal: React.FC<RoleFormModalProps> = (props: RoleFormModalProps) => {
    const { t } = useTranslation();

    // 菜单请求状态对象
    const menuReqState = useAxios<Res<SysMenu[]>>({ url: API.MENU_LIST, method: 'get', manual: false });

    // '保存' 请求状态对象
    const saveReqState = useAxios<Res<SysRole>>({});

    // 选中的菜单
    const [checkedKeys, setCheckedKeys] = useState(props.record?.menus.map((item) => item.id) || []);

    // 服务端回传的表单校验错误信息
    const validErrors = useMemo(() => (saveReqState.resp?.data as ValidError)?.errors || [], [saveReqState.resp?.data]);

    // 把从服务器得到的菜单列表转化成树
    const menuTree = useMemo(() => {
        if (menuReqState.resp?.data) return buildMenuTree(menuReqState.resp?.data, new Set(checkedKeys));
    }, [menuReqState.resp?.data, checkedKeys]);

    // 树形选择器选中事件
    const onCheck: TreeProps['onCheck'] = (checkedKeys, e) => {
        if (Array.isArray(checkedKeys)) {
            const halfChecked = e.halfCheckedKeys ? e.halfCheckedKeys : [];
            setCheckedKeys([...checkedKeys, ...halfChecked] as number[]);
        } else {
            setCheckedKeys([...checkedKeys.checked, ...checkedKeys.halfChecked] as number[]);
        }
    };

    // 保存事件
    const onFinish = useCallback(
        async (value: object) => {
            const url = props.record ? `${API.ROLE_UPDATE}/${props.record.id}` : API.ROLE_CREATE;
            const res = await saveReqState.fetch({ url: url, method: 'post', data: { ...value, menuIds: checkedKeys } });
            if (res?.code === ResCode.SUCCESS) {
                props.onFinish();
                return true;
            }
            return false;
        },
        [checkedKeys, props, saveReqState]
    );

    // 初始化 Modal 数据
    useEffect(() => {
        saveReqState.reset();
        setCheckedKeys(props.record?.menus.map((item) => item.id) || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props]);

    return (
        <Spin spinning={menuReqState.loading || saveReqState.loading}>
            <ModalForm
                modalProps={{ destroyOnClose: true, getContainer: false }}
                initialValues={{
                    ...props.record,
                    menuIds: props.record?.menus.map((item) => {
                        return item.id;
                    }),
                }}
                submitTimeout={1000}
                open={props.visible}
                onFinish={onFinish}
                onOpenChange={props.onOpenChange}
            >
                <ProForm.Group>
                    <ProFormText
                        name='name'
                        width='xl'
                        label={t('form.common.name')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 31 }, { min: 2 }, { required: true }]}
                        required
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        name='description'
                        width='xl'
                        label={t('form.common.description')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 255 }, { min: 2 }]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProForm.Item label={t('form.role.allowedRoutes')}>
                        <Card bordered={true} style={{ width: 552 }}>
                            <Tree
                                checkable
                                // checkStrictly
                                defaultCheckedKeys={menuTree?.checked || []}
                                onCheck={onCheck}
                                fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                                treeData={menuTree?.tree as unknown as DataNode[] || []}
                                disabled={props.record?.id == 1 ? true : false}
                            />
                        </Card>
                    </ProForm.Item>
                </ProForm.Group>
                {validErrors &&
                    validErrors.map((msg) => (
                        <Alert
                            style={{
                                marginBottom: 24,
                            }}
                            key={msg}
                            message={msg}
                            type='error'
                            showIcon
                        />
                    ))}
            </ModalForm>
        </Spin>
    );
};
