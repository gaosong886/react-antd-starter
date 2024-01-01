import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { API } from '../../../../../api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAxios } from '../../../../../hooks/axios';
import { Alert, Card, Spin, Tree, TreeProps } from 'antd';
import { DataNode } from 'antd/es/tree';
import { useTranslation } from 'react-i18next';
import { buildMenuTree } from '../../../../../utils/menu-tree';

export interface RoleFormModalProps {
    visible: boolean;
    record?: API.SysRole;
    onOpenChange: (visible: boolean) => void;
    onFinish: () => void;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = (props: RoleFormModalProps) => {
    const menuState = useAxios<API.Res<API.SysMenu[]>>({ url: API.URL.MENU_LIST, method: 'get', manual: false });
    const saveRecordState = useAxios<API.Res<API.SysRole>>({});

    const [checkedKeys, setCheckedKeys] = useState(props.record?.menus.map((item) => item.id) || []);
    const validationMsgs = useMemo(() => (saveRecordState.resp?.data as API.ValidError)?.errors || [], [saveRecordState.resp?.data]);

    const { t } = useTranslation();

    const menuTree = useMemo(() => {
        if (menuState.resp?.data) {
            return buildMenuTree(menuState.resp?.data, new Set(checkedKeys));
        }
    }, [menuState.resp?.data, checkedKeys]);

    const onFinish = useCallback(
        async (value: object) => {
            const url = props.record ? `${API.URL.ROLE_UPDATE}/${props.record.id}` : API.URL.ROLE_CREATE;
            const res = await saveRecordState.fetchAsync({ url: url, method: 'post', data: { ...value, menuIds: checkedKeys } });
            if (res?.code === API.CODE.SUCCESS) {
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
                        rules={[{ max: 32 }, { min: 2 }, { required: true }]}
                        required
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        name='description'
                        width='xl'
                        label={t('form.common.description')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 256 }, { min: 2 }]}
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
