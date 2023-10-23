from .dataqueries import ecdf


def score_comparables(input_data, targ, new_targ, cur_comps, max_comps, prop_info):
    # process comps

    # add weights based on Cook PINS AA-SS-BBB-PPP-UUUU
    # pos 7 high
    # 6 medium
    # 5 low

    dist_weight = 1
    valuation_weight = 3

    cur_comps["dist_dist"] = ecdf(cur_comps.Distance)(cur_comps.Distance, True)
    cur_comps["val_dist"] = ecdf(cur_comps.assessed_value)(
        cur_comps.assessed_value, True
    )
    cur_comps["score"] = (
        dist_weight * cur_comps["dist_dist"] + valuation_weight * cur_comps["val_dist"]
    )

    if input_data["appeal_type"] == "detroit_single_family":  # neighborhood bonus
        cur_comps["neigborhoodmatch"] = (
            cur_comps["neighborhood"] == targ["neighborhood"].values[0]
        )
        cur_comps["neigborhoodmatch"] = cur_comps["neigborhoodmatch"].astype(int)
        cur_comps["score"] = cur_comps["score"] + 1 * cur_comps["neigborhoodmatch"]
        cur_comps = cur_comps.drop(["neigborhoodmatch"], axis=1)

    cur_comps = cur_comps.sort_values(by=["score"], ascending=False)
    cur_comps = cur_comps.head(max_comps)
    new_targ = new_targ.round(2)
    cur_comps = cur_comps.round(2).drop(["dist_dist", "val_dist"], axis=1)

    output = {}
    new_targ = new_targ.fillna("")
    cur_comps = cur_comps.fillna("")

    output["target_pin"] = new_targ.drop("assessed_value", axis=1).to_dict(
        orient="records"
    )
    output["comparables"] = cur_comps.drop("assessed_value", axis=1).to_dict(
        orient="records"
    )
    output["labeled_headers"] = cur_comps.drop(
        "assessed_value", axis=1
    ).columns.tolist()
    output["prop_info"] = prop_info
    output["pinav"] = new_targ.assessed_value.mean()

    return output
