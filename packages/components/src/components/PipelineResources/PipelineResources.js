/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { urls } from '@tektoncd/dashboard-utils';

import { RunDropdown, Table } from '..';

const PipelineResources = ({
  createPipelineResourcesURL = urls.pipelineResources.byName,
  createPipelineResourceDisplayName = ({ pipelineResourceMetadata }) =>
    pipelineResourceMetadata.name,
  intl,
  loading,
  pipelineResourceActions,
  pipelineResources,
  selectedNamespace
}) => {
  const headers = [
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    {
      key: 'namespace',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.namespace',
        defaultMessage: 'Namespace'
      })
    },
    {
      key: 'type',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.type',
        defaultMessage: 'Type'
      })
    },
    {
      key: 'dropdown',
      header: ''
    }
  ];

  const pipelineResourcesFormatted = pipelineResources.map(pipelineResource => {
    const { namespace } = pipelineResource.metadata;
    const pipelineResourceName = createPipelineResourceDisplayName({
      pipelineResourceMetadata: pipelineResource.metadata
    });
    const url = createPipelineResourcesURL({
      namespace,
      pipelineResourceName
    });

    return {
      id: pipelineResource.metadata.uid,
      name: url ? (
        <Link to={url}>{pipelineResourceName}</Link>
      ) : (
        pipelineResourceName
      ),
      namespace,
      type: pipelineResource.spec.type,
      dropdown: (
        <RunDropdown
          items={pipelineResourceActions}
          resource={pipelineResource}
        />
      )
    };
  });

  return (
    <Table
      headers={headers}
      rows={pipelineResourcesFormatted}
      loading={loading}
      selectedNamespace={selectedNamespace}
      emptyTextAllNamespaces={intl.formatMessage(
        {
          id: 'dashboard.emptyState.allNamespaces',
          defaultMessage: 'No {kind} under any namespace.'
        },
        { kind: 'PipelineResources' }
      )}
      emptyTextSelectedNamespace={intl.formatMessage(
        {
          id: 'dashboard.emptyState.selectedNamespace',
          defaultMessage: 'No {kind} under namespace {selectedNamespace}'
        },
        { kind: 'PipelineResources', selectedNamespace }
      )}
    />
  );
};

export default injectIntl(PipelineResources);
