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

export const RoleFormModal: React.FC<RoleFormModalProps> = (props: RoleFormModalProps) => {
    const { t } = useTranslation();

    const menuState = useAxios<Res<SysMenu[]>>({ url: API.MENU_LIST, method: 'get', manual: false });
    const saveRecordState = useAxios<Res<SysRole>>({});

    const [checkedKeys, setCheckedKeys] = useState(props.record?.menus.map((item) => item.id) || []);
    const validationMsgs = useMemo(() => (saveRecordState.resp?.data as ValidError)?.errors || [], [saveRecordState.resp?.data]);

    const menuTree = useMemo(() => {
        if (menuState.resp?.data) {
            return buildMenuTree(menuState.resp?.data, new Set(checkedKeys));
        }
    }, [menuState.resp?.data, checkedKeys]);

    const onFinish = useCallback(
        async (value: object) => {
            const url = props.record ? `${API.ROLE_UPDATE}/${props.record.id}` : API.ROLE_CREATE;
            const res = await saveRecordState.fetchAsync({ url: url, method: 'post', data: { ...value, menuIds: checkedKeys } });
            if (res?.code === ResCode.SUCCESS) {
                props.onFinish();
                return true;
            }
            return false;
        },
        [checkedKeys, props, saveRecordState]
    );

    useEffect(() => {
        saveRecordState.reset();
        setCheckedKeys(props.record?.menus.map((item) => item.id) || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props]);

    const onCheck: TreeProps['onCheck'] = (checkedKeys, e) => {
        if (Array.isArray(checkedKeys)) {
            const halfChecked = e.halfCheckedKeys ? e.halfCheckedKeys : [];
            setCheckedKeys([...checkedKeys, ...halfChecked] as number[]);
        } else {
            setCheckedKeys([...checkedKeys.checked, ...checkedKeys.halfChecked] as number[]);
        }
    };

    return (
        <Spin spinning={menuState.loading || saveRecordState.loading}>
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
                                defaultCheckedKeys={menuTree?.checked || []}
                                onCheck={onCheck}
                                fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                                treeData={menuTree?.tree as unknown as DataNode[]}
                                disabled={props.record?.id == 1 ? true : false}
                            />
                        </Card>
                    </ProForm.Item>
                </ProForm.Group>
                {validationMsgs &&
                    validationMsgs.map((msg) => (
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
