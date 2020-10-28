// import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import * as k8s from 'vscode-kubernetes-tools-api';

export async function aso(explorer: k8s.ClusterExplorerV1): Promise<k8s.ClusterExplorerV1.NodeContributor> {
    const allKinds = await allServiceKinds();
    const allFolderChildren = allKinds.map((k) => explorer.nodeSources.resourceFolder(k.displayName, k.displayName, k.manifestKind, k.abbreviation));
    const allFolder = explorer.nodeSources.groupingFolder("All Service Types", undefined, ...allFolderChildren);

    const pinnedKinds = await pinnedServiceKinds(allKinds);
    const resourceFolderChildren = pinnedKinds.map((k) => explorer.nodeSources.resourceFolder(k.displayName, k.displayName, k.manifestKind, k.abbreviation));

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
    readonly manifestKind: string;
    readonly abbreviation: string;
}

// interface AzureServiceInstance {
//     readonly displayName: string;
//     readonly armId: string;
//     readonly resourceType: string;
// }

async function pinnedServiceKinds(allKinds: AzureServiceKind[]): Promise<AzureServiceKind[]> {
    const pinnedKindNames = ["mysqldatabases", "eventhubs"];  // TODO: get from config
    return allKinds.filter((k) => pinnedKindNames.includes(k.abbreviation));
}

// should be errorable but skip for prototype
async function allServiceKinds(): Promise<AzureServiceKind[]> {
    const kubectl = await k8s.extension.kubectl.v1;
    if (!kubectl.available) {
        return [];  // TODO: ERROR
    }
    const sr = await kubectl.api.invokeCommand("api-resources --api-group azure.microsoft.com --no-headers");
    if (!sr || sr.code !== 0) {
        return [];  // TODO: ERROR
    }

    const lines = sr.stdout.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    return lines.map((l) => parseServiceResource(l));
    // return [
    //     { displayName: "Blob Storage Accounts", kind: "BlobStorageAccount", resourceType: "blobstorageaccounts" },
    //     { displayName: "Event Hubs", kind: "Eventhub", resourceType: "eventhubs" },
    //     { displayName: "MySQL Servers", kind: "MySQLServer", resourceType: "mysqlservers" },
    //     { displayName: "Service Buses", kind: "ServiceBus", resourceType: "servicebus" },
    // ];
}

function parseServiceResource(text: string): AzureServiceKind {
    const bits = text.split(' ').filter((s) => s.length > 0);
    if (bits.length === 4) {
        // name, apigroup, namespaced, kind
        return { displayName: bits[3], manifestKind: bits[3], abbreviation: bits[0] };
    } else if (bits.length === 5) {
        // name, shortnames, apigroup, namespaced, kind
        return { displayName: bits[4], manifestKind: bits[4], abbreviation: bits[0] };
    } else {
        return { displayName: "WAT " + text, manifestKind: "WAT", abbreviation: "wat" };
    }
}
