import { Placeholder, Table } from "react-bootstrap";

interface ArtistReleasesTableSkeletonProps {
    rows?: number;
}

// Mirrors the real releases <Table> on ArtistPage: Title, Year columns.
const ArtistReleasesTableSkeleton = ({ rows = 8 }: ArtistReleasesTableSkeletonProps) => (
    <div className="table-responsive">
        <Table striped hover className="browse-catalog-table align-middle">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Year</th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, i) => (
                    <tr key={i}>
                        <td>
                            <Placeholder as="span" animation="glow">
                                <Placeholder xs={8} />
                            </Placeholder>
                        </td>
                        <td>
                            <Placeholder as="span" animation="glow">
                                <Placeholder xs={4} />
                            </Placeholder>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>
);

export default ArtistReleasesTableSkeleton;
