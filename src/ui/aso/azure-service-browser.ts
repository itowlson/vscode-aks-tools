// import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import * as k8s from 'vscode-kubernetes-tools-api';

export async function aso(explorer: k8s.ClusterExplorerV1): Promise<k8s.ClusterExplorerV1.NodeContributor> {
    const pinnedKinds = await pinnedServiceKinds();
    const resourceFolderChildren = pinnedKinds.map((k) => explorer.nodeSources.resourceFolder(k.displayName, k.displayName, k.kind, k.resourceType));
    const allKinds = await allServiceKinds();
    const allFolderChildren = allKinds.map((k) => explorer.nodeSources.resourceFolder(k.displayName, k.displayName, k.kind, k.resourceType));
    const allFolder = explorer.nodeSources.groupingFolder("All Service Types", undefined, ...allFolderChildren);

    const children = [...resourceFolderChildren, allFolder];
    const servicesFolder = explorer.nodeSources.groupingFolder("Azure Services", undefined, ...children);
    return servicesFolder.at(undefined);
}

// export class AzureServiceBrowser implements k8s.ClusterExplorerV1.NodeContributor {
//     constructor(private readonly explorer: k8s.ClusterExplorerV1) {}
//     contributesChildren(parent: k8s.ClusterExplorerV1.ClusterExplorerNode | undefined): boolean {
//         return !!parent && parent.nodeType === 'context';
//     }
//     async getChildren(parent: k8s.ClusterExplorerV1.ClusterExplorerNode | undefined): Promise<k8s.ClusterExplorerV1.Node[]> {
//         if (this.contributesChildren(parent)) {
//             return [new AzureServicesFolderNode(this.explorer)];
//         }
//         return [];
//     }
// }

// class AzureServicesFolderNode implements k8s.ClusterExplorerV1.Node {
//     constructor(private readonly explorer: k8s.ClusterExplorerV1) {}
//     async getChildren(): Promise<k8s.ClusterExplorerV1.Node[]> {
//         const pinnedNodes = (await pinnedServiceKinds()).map((k) => new AzureServiceKindNode(this.explorer, k));
//         const allNode = new AllAzureServicesFolderNode(this.explorer);
//         return [...pinnedNodes, allNode];
//     }
//     getTreeItem(): TreeItem {
//         return new TreeItem("Azure Services", TreeItemCollapsibleState.Collapsed);
//     }
// }

// class AllAzureServicesFolderNode implements k8s.ClusterExplorerV1.Node {
//     constructor(private readonly explorer: k8s.ClusterExplorerV1) {}
//     async getChildren(): Promise<k8s.ClusterExplorerV1.Node[]> {
//         const all = [
//             { displayName: "Blob Storage Accounts", kind: "BlobStorageAccount", resourceType: "blobstorageaccounts" },
//             { displayName: "Event Hubs", kind: "Eventhub", resourceType: "eventhubs" },
//             { displayName: "MySQL Servers", kind: "MySQLServer", resourceType: "mysqlservers" },
//             { displayName: "Service Buses", kind: "ServiceBus", resourceType: "servicebus" },
//         ];
//         return all.map((k) => new AzureServiceKindNode(this.explorer, k));
//     }
//     getTreeItem(): TreeItem {
//         return new TreeItem("All Service Types", TreeItemCollapsibleState.Collapsed);
//     }

// }

// class AzureServiceKindNode  implements k8s.ClusterExplorerV1.Node {
//     constructor(private readonly explorer: k8s.ClusterExplorerV1, private readonly kind: AzureServiceKind) {}
//     async getChildren(): Promise<k8s.ClusterExplorerV1.Node[]> {
//         return [];
//     }
//     getTreeItem(): TreeItem {
//         return new TreeItem(this.kind.displayName, TreeItemCollapsibleState.Collapsed);
//     }
// }

export interface AzureServiceKind {
    readonly displayName: string;
    readonly kind: string;
    readonly resourceType: string;
}

// interface AzureServiceInstance {
//     readonly displayName: string;
//     readonly armId: string;
//     readonly resourceType: string;
// }

async function pinnedServiceKinds(): Promise<AzureServiceKind[]> {
    return [
        { displayName: "Event Hubs", kind: "Eventhub", resourceType: "eventhubs" },
        { displayName: "MySQL Servers", kind: "MySQLServer", resourceType: "mysqlservers" },
    ];
}

async function allServiceKinds(): Promise<AzureServiceKind[]> {
    return [
        { displayName: "Blob Storage Accounts", kind: "BlobStorageAccount", resourceType: "blobstorageaccounts" },
        { displayName: "Event Hubs", kind: "Eventhub", resourceType: "eventhubs" },
        { displayName: "MySQL Servers", kind: "MySQLServer", resourceType: "mysqlservers" },
        { displayName: "Service Buses", kind: "ServiceBus", resourceType: "servicebus" },
    ];
}
