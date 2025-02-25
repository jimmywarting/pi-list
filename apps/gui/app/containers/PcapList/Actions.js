import tableActions from '../../utils/models/table/actions';

const Actions = {
    ...tableActions,
    requestPcapReanalysis: 'requestPcapReanalysis', // data: { id : String }
    reanalyzePcap: 'reanalyzePcap', // data: { id : String }
    selectBefore: 'selectBefore', // data: { id : String }
    selectAfter: 'selectAfter', // data: { id : String }
    pcapReceived: 'pcapReceived', // data: { pcap : {} }
    pcapProcessed: 'pcapProcessed',
    pcapFailed: 'pcapFailed',
    pcapDone: 'pcapDone',
    deletePcap: 'deletePcap', // data: { id : String },
    pcapDeleted: 'pcapDeleted', // data: { id : String },
    zipFileFailed: 'zipFileFailed', // data: { id : String },
    zipFileComplete: 'zipFileComplete', // data: { id : String },
    downloadSelectOriginalCapture: 'downloadSelectOriginalCapture', // data: { ids : [ String ] },
    downloadSelectedPcap: 'downloadSelectedPcap', // data: { ids : [ String ] },
    downloadSelectedSdp: 'downloadSelectedSdp', // data: { ids : [ String ] },
    downloadSelectedJsonReport: 'downloadSelectedJsonReport', // data: { ids : [ String ] },
    downloadSelectedPdfReport: 'downloadSelectedPdfReport', // data: { ids : [ String ] },
};

export default Actions;
