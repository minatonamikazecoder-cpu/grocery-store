import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const UpdateOffer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        offerDescription: "",
        offerCode: "",
        discount: "",
        maxDiscount: "",
        minimumOrder: "",
        startDate: "",
        endDate: "",
    });

    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const response = await api.get(`/offers/${id}`);
                const data = response.data;

                setFormData({
                    offerDescription: data.offerDescription || "",
                    offerCode: data.offerCode || "",
                    discount: data.discount?.toString() || "",
                    maxDiscount: data.maxDiscount?.toString() || "",
                    minimumOrder: data.minimumOrder?.toString() || "",
                    startDate: data.startDate?.split("T")[0] || "",
                    endDate: data.endDate?.split("T")[0] || "",
                });
            } catch (error) {
                toast.error("Failed to fetch offer details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOffer();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setErrors((prevErrors: any) => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name: string, value: string) => {
        let error: string | null = null;

        if (name === "offerDescription" && (!value.trim() || value.length < 5)) {
            error = "Offer description must be at least 5 characters.";
        }

        if (name === "offerCode" && (!/^[A-Z0-9]+$/.test(value) || value.length < 3 || value.length > 10)) {
            error = "Offer code must be 3-10 uppercase letters or numbers.";
        }

        if (name === "discount" && (!/^\d+$/.test(value) || +value < 1 || +value > 100)) {
            error = "Discount must be between 1% and 100%.";
        }

        if ((name === "maxDiscount" || name === "minimumOrder") && (!/^\d+$/.test(value) || +value <= 0)) {
            error = `${name === "maxDiscount" ? "Maximum discount" : "Minimum order"} must be greater than 0.`;
        }

        if (name === "startDate" && !value) {
            error = "Start date is required.";
        }

        if (name === "endDate") {
            if (!value) {
                error = "End date is required.";
            } else if (formData.startDate && new Date(value) <= new Date(formData.startDate)) {
                error = "End date must be after start date.";
            }
        }

        return error;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formErrors: Record<string, string> = {};
        Object.keys(formData).forEach((field) => {
            const error = validateField(field, (formData as any)[field]);
            if (error) formErrors[field] = error;
        });

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            await api.put(`/offers/${id}`, {
                offerDescription: formData.offerDescription,
                offerCode: formData.offerCode,
                discount: parseFloat(formData.discount),
                maxDiscount: parseFloat(formData.maxDiscount),
                minimumOrder: parseFloat(formData.minimumOrder),
                startDate: formData.startDate,
                endDate: formData.endDate,
            });

            toast.success("Offer updated successfully!");
            navigate("/admin/offers");
        } catch (error) {
            toast.error("Failed to update the offer.");
        }
    };

    if (loading) return <p>Loading offer data...</p>;

    return (
        <div>
            <h1 className="mt-4">Update Offer</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/admin/offers">Offers</Link></li>
                <li className="breadcrumb-item active">Update Offer</li>
            </ol>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Offer Description</label>
                            <input
                                type="text"
                                className="form-control"
                                name="offerDescription"
                                value={formData.offerDescription}
                                onChange={handleChange}
                            />
                            {errors.offerDescription && <p className="text-danger">{errors.offerDescription}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Offer Code</label>
                            <input
                                type="text"
                                className="form-control"
                                name="offerCode"
                                value={formData.offerCode}
                                onChange={handleChange}
                            />
                            {errors.offerCode && <p className="text-danger">{errors.offerCode}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Discount (%)</label>
                            <input
                                type="text"
                                className="form-control"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                            />
                            {errors.discount && <p className="text-danger">{errors.discount}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Maximum Discount Amount</label>
                            <input
                                type="text"
                                className="form-control"
                                name="maxDiscount"
                                value={formData.maxDiscount}
                                onChange={handleChange}
                            />
                            {errors.maxDiscount && <p className="text-danger">{errors.maxDiscount}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Minimum Order Amount</label>
                            <input
                                type="text"
                                className="form-control"
                                name="minimumOrder"
                                value={formData.minimumOrder}
                                onChange={handleChange}
                            />
                            {errors.minimumOrder && <p className="text-danger">{errors.minimumOrder}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                            {errors.startDate && <p className="text-danger">{errors.startDate}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                            {errors.endDate && <p className="text-danger">{errors.endDate}</p>}
                        </div>

                        <button type="submit" className="btn btn-primary">Update Offer</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateOffer;
