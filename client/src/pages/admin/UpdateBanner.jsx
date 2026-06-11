import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const UpdateBanner = () => {
	const { id } = useParams();

	const [formData, setFormData] = useState({
		bannerImage: null,
		bannerOrder: "",
		bannerStatus: "",
	});
	const [previewImage, setPreviewImage] = useState("");
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		const fetchBanner = async () => {
			try {
				const res = await api.get(
					`/banners/${id}`
				);
				const banner = res.data;

				setFormData({
					bannerImage: null,
					bannerOrder: banner.viewOrder.toString(),
					bannerStatus: banner.activeStatus ? "1" : "0",
				});
				setPreviewImage(banner.bannerImage);
			} catch (err) {
				toast.error("Failed to load banner details.");
				console.error(err);
			}
		};

		fetchBanner();
	}, [id]);

	const handleChange = (e) => {
		const { name, value, type, files } = e.target;
		const newValue = type === "file" ? files[0] : value;

		// if (name === "bannerImage" && files[0]) {
		// 	setPreviewImage(URL.createObjectURL(files[0]));
		// }

		setFormData((prev) => ({ ...prev, [name]: newValue }));
		const error = validateField(name, newValue);
		setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
	};

	const validateField = (name, value) => {
		let error = null;
		if (name === "bannerImage") {
			if (
				value &&
				!["image/jpeg", "image/png", "image/jpg"].includes(value.type)
			) {
				error = "Only JPG, JPEG, and PNG images are allowed.";
			}
		}
		if (name === "bannerOrder") {
			if (!value.trim()) {
				error = "View order is required.";
			} else if (!/^\d+$/.test(value) || parseInt(value) <= 0) {
				error = "View order must be a positive number.";
			}
		}
		if (name === "bannerStatus" && value === "") {
			error = "Status is required.";
		}
		return error;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true); // Start loading

		const formErrors = {};
		Object.keys(formData).forEach((field) => {
			const error = validateField(field, formData[field]);
			if (error) formErrors[field] = error;
		});

		if (Object.values(formErrors).some(Boolean)) {
			setErrors(formErrors);
			setLoading(false); // Stop loading if errors found
			return;
		}

		try {
			const data = new FormData();
			data.append("viewOrder", formData.bannerOrder);
			data.append("activeStatus", formData.bannerStatus === "1");
			if (formData.bannerImage) {
				data.append("bannerImage", formData.bannerImage);
			}

			await api.put(`/banners/${id}`, data);
			toast.success("Banner updated successfully!");
			navigate("/admin/banners");
		} catch (err) {
			console.error(err);
			toast.error("Failed to update banner.");
		} finally {
			setLoading(false); // Stop loading regardless of result
		}
	};

	return (
		<div>
			<h1 className="mt-4">Update Banner</h1>
			<ol className="breadcrumb mb-4">
				<li className="breadcrumb-item">
					<Link to="/admin">Dashboard</Link>
				</li>
				<li className="breadcrumb-item">
					<Link to="/admin/banners">Banners</Link>
				</li>
				<li className="breadcrumb-item active">Update Banner</li>
			</ol>

			<div className="card mb-4">
				<div className="card-body">
					<form onSubmit={handleSubmit} encType="multipart/form-data">
						<div className="row">
							<div className="col-md-6">
								<div className="mb-3">
									<label
										htmlFor="bannerStatus"
										className="form-label"
									>
										Status
									</label>
									<select
										className="form-select"
										id="bannerStatus"
										name="bannerStatus"
										value={formData.bannerStatus}
										onChange={handleChange}
									>
										<option value="1">Active</option>
										<option value="0">Inactive</option>
									</select>
									{errors.bannerStatus && (
										<p className="text-danger">
											{errors.bannerStatus}
										</p>
									)}
								</div>
							</div>
							<div className="col-md-6">
								<div className="mb-3">
									<label
										htmlFor="bannerOrder"
										className="form-label"
									>
										View Order
									</label>
									<input
										type="number"
										className="form-control"
										id="bannerOrder"
										name="bannerOrder"
										value={formData.bannerOrder}
										onChange={handleChange}
									/>
									{errors.bannerOrder && (
										<p className="text-danger">
											{errors.bannerOrder}
										</p>
									)}
								</div>
							</div>
						</div>

						<div className="mb-3">
							<label htmlFor="bannerImage" className="form-label">
								Banner Image
							</label>
							<input
								type="file"
								className="form-control"
								id="bannerImage"
								name="bannerImage"
								accept="image/png, image/jpeg, image/jpg"
								onChange={handleChange}
							/>
							{previewImage && (
								<img
									src={previewImage}
									alt="Preview"
									className="w-25 mt-2"
								/>
							)}
							{errors.bannerImage && (
								<p className="text-danger">
									{errors.bannerImage}
								</p>
							)}
						</div>

						<button
							type="submit"
							className="btn btn-primary"
							disabled={loading}
						>
							{loading ? "Updating..." : "Update Banner"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default UpdateBanner;
