const actions = {
    clearSelection: 'clearSelection',
    toggleRow: 'toggleRow', // data: { id : String }
    toggleSelectAll: 'toggleSelectAll',
    requestDelete: 'requestDelete', // data: { ids : [ String ] }
    setFilterString: 'setFilterString', // payload: { value : String },
    requestCancel: 'requestCancel', // data: { ids : [ String ] },
};

export default actions;
