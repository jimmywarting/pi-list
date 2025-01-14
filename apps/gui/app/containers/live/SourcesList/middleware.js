import { types as workflowTypes } from 'ebu_list_common/workflows/types';
import sources from 'ebu_list_common/capture/sources';
import uuid from 'uuid';
import Actions from './Actions';
import api from '../../../utils/api';
import notifications from '../../../utils/notifications';
import { translate } from '../../../utils/translation';

const middleware = (state, action) => {
    switch (action.type) {
        case Actions.deleteLiveSources:
            {
                const ids = action.payload.ids;

                api.deleteLiveSources(ids)
                    .then(() => {
                        notifications.success({
                            title: translate('notifications.success.live.sources.deleted'),
                            message: translate('notifications.success.live.sources.delete_message'),
                        });
                    })
                    .catch(() => {
                        notifications.error({
                            titleTag: 'notifications.error.live.sources.deleted',
                            messageTag: 'notifications.error.live.sources.delete_message',
                        });
                    });
            }
            break;

        case Actions.captureFromSources:
            {
                const workflowInfo = {
                    type: workflowTypes.captureAndIngest,
                    configuration: {
                        ids: action.payload.ids,
                        filename: action.payload.filename,
                        durationMs: action.payload.durationMs,
                    },
                };

                api.createWorkflow(workflowInfo)
                    .then(() => {
                        notifications.success({
                            titleTag: 'workflow.requested',
                            messageTag: 'workflow.requested',
                        });
                    })
                    .catch(() => {
                        notifications.error({
                            titleTag: 'workflow.request_failed',
                            messageTag: 'workflow.request_failed',
                        });
                    });
            }
            break;

        case Actions.addSources:
            {
                const s = action.payload.sources || [];

                s.forEach(source => {
                    const descriptor = {
                        id: !source.id ? uuid.v1() : source.id,
                        meta: {
                            label: source.description || 'User defined',
                        },
                        kind: sources.kinds.user_defined,
                        sdp: {
                            streams: [
                                {
                                    dstAddr: source.dstAddr,
                                    dstPort: parseInt(source.dstPort, 10),
                                },
                            ],
                        },
                    };

                    api.addLiveSource(descriptor)
                        .then(() => {
                            notifications.success({
                                titleTag: 'workflow.added',
                                messageTag: 'workflow.added',
                            });
                        })
                        .catch(() => {
                            notifications.error({
                                titleTag: 'workflow.add_failed',
                                messageTag: 'workflow.add_failed',
                            });
                        });
                });
            }
            break;

        default:
            break;
    }
};

export { middleware };
