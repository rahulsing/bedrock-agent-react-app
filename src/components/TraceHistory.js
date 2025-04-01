import React, { useState } from 'react';
import './TraceHistory.css';

const TraceHistory = ({ traceHistory, isTraceEnabled, onTraceToggle, onClearTrace }) => {
    const [expandedTraces, setExpandedTraces] = useState({});
    const [expandedSections, setExpandedSections] = useState({});

    const toggleTrace = (traceId) => {
        setExpandedTraces(prev => ({
            ...prev,
            [traceId]: !prev[traceId]
        }));
    };

    const toggleSection = (traceId, section) => {
        const key = `${traceId}-${section}`;
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const formatValue = (value) => {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2);
        }
        return value;
    };

    const renderTraceSection = (traceId, sectionName, data) => {
        const sectionKey = `${traceId}-${sectionName}`;
        const isExpanded = expandedSections[sectionKey];

        if (!data) return null;

        return (
            <div className="trace-section">
                <div 
                    className="trace-section-header"
                    onClick={() => toggleSection(traceId, sectionName)}
                >
                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        ▶
                    </span>
                    {sectionName}
                </div>
                {isExpanded && (
                    <div className="trace-section-content">
                        {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="trace-field">
                                <span className="field-name">{key}:</span>
                                <span className="field-value">
                                    {formatValue(value)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderTrace = (trace, index) => {
        const traceId = `${trace.queryUuid}-${index}`;
        const isExpanded = expandedTraces[traceId];

        const {
            eventTime,
            trace: traceData,
            agentId,
            sessionId
        } = trace;

        const orchestrationTrace = traceData?.orchestrationTrace;
        const actionTrace = traceData?.actionTrace;

        return (
            <div key={traceId} className="trace-item">
                <div 
                    className="trace-header"
                    onClick={() => toggleTrace(traceId)}
                >
                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        ▶
                    </span>
                    <span className="trace-time">
                        {new Date(eventTime).toLocaleString()}
                    </span>
                </div>
                {isExpanded && (
                    <div className="trace-details">
                        <div className="trace-info">
                            <div>Session ID: {sessionId}</div>
                            <div>Agent ID: {agentId}</div>
                        </div>
                        
                        {orchestrationTrace && renderTraceSection(
                            traceId,
                            'Orchestration Trace',
                            {
                                modelInvocationInput: orchestrationTrace.modelInvocationInput,
                                modelInvocationOutput: orchestrationTrace.modelInvocationOutput
                            }
                        )}
                        
                        {actionTrace && renderTraceSection(
                            traceId,
                            'Action Trace',
                            {
                                actionGroup: actionTrace.actionGroup,
                                actionName: actionTrace.actionName,
                                status: actionTrace.status,
                                response: actionTrace.response
                            }
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="trace-panel">
            <div className="trace-controls-header">
                <h3>Trace History</h3>
                <div className="trace-controls">
                    <button 
                        className={`control-button ${isTraceEnabled ? 'enabled' : ''}`}
                        onClick={onTraceToggle}
                    >
                        {isTraceEnabled ? 'Disable' : 'Enable'} Trace
                    </button>
                    <button 
                        className="control-button"
                        onClick={onClearTrace}
                    >
                        Clear
                    </button>
                </div>
            </div>
            <div className="trace-content">
                {traceHistory.length === 0 ? (
                    <div className="trace-empty">No trace data available</div>
                ) : (
                    traceHistory.map((trace, index) => renderTrace(trace, index))
                )}
            </div>
        </div>
    );
};


export default TraceHistory;
