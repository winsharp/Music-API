import { Placeholder, Table } from "react-bootstrap";

interface BrowseCatalogTableSkeletonProps {
    rows?: number;
}

/**
 * Loading placeholder mirroring the real `<Table>` in BrowseCatalogPage:
 * Title (image + text), Artist, Year, Genre, Rate / Collect columns.
 */
const BrowseCatalogTableSkeleton = ({ rows = 8 }: BrowseCatalogTableSkeletonProps) => (
    <div className="table-responsive">
        <Table striped hover className="browse-catalog-table align-middle">
            <thead>
                <tr>
                    <th>Title</th>
                    <th className="d-none d-sm-table-cell">Artist</th>
                    <th className="d-none d-sm-table-cell">Year</th>
                    <th className="d-none d-sm-table-cell">Genre</th>
                    <th>Rate / Collect</th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, i) => (
                    <tr key={i}>
                        <td>
                            <div className="d-flex align-items-center gap-2">
                                <Placeholder as="div" animation="glow">
                                    <Placeholder style={{ width: 40, height: 40 }} className="d-block" />
                                </Placeholder>
                                <Placeholder as="span" animation="glow" className="flex-grow-1">
                                    <Placeholder xs={8} />
                                </Placeholder>
                            </div>
                        </td>
                        <td className="d-none d-sm-table-cell">
                            <Placeholder as="span" animation="glow">
                                <Placeholder xs={6} />
                            </Placeholder>
                        </td>
                        <td className="d-none d-sm-table-cell">
                            <Placeholder as="span" animation="glow">
                                <Placeholder xs={4} />
                            </Placeholder>
                        </td>
                        <td className="d-none d-sm-table-cell">
                            <Placeholder as="span" animation="glow">
                                <Placeholder xs={5} />
                            </Placeholder>
                        </td>
                        <td>
                            <Placeholder.Button variant="primary" xs={7} size="sm" />
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>
);

export default BrowseCatalogTableSkeleton;
